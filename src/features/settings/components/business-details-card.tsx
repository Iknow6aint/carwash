"use client";

import { useState, type FormEvent } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { Blueprint } from "@/components/ui/blueprint";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/api-error";
import { useCan } from "@/providers/session-provider";

import { useBusinessSettings, useUpdateBusinessSettings } from "../hooks/use-business-settings";
import { updateBusinessSettingsSchema, type BusinessSettings } from "../schemas/settings.schema";

type TextField = "name" | "phone" | "address" | "receiptFooter";

const FIELDS: ReadonlyArray<{
  field: TextField;
  label: string;
  maxLength: number;
  autoComplete?: string;
}> = [
  { field: "name", label: "Business name", maxLength: 80, autoComplete: "organization" },
  { field: "phone", label: "Phone", maxLength: 30, autoComplete: "tel" },
  { field: "address", label: "Address", maxLength: 160, autoComplete: "street-address" },
  { field: "receiptFooter", label: "Receipt footer", maxLength: 120 },
];

/** Business details printed on every receipt. Admins edit; cashiers see them read-only. */
export function BusinessDetailsCard() {
  const settings = useBusinessSettings();
  return (
    <Blueprint as="section" className="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5 p-5">
      <div className="flex flex-col gap-0.5">
        <h3>Business details</h3>
        <p className="text-[13px] text-neutral-700">Printed on every receipt.</p>
      </div>
      {settings.isPending ? (
        <div
          aria-busy="true"
          aria-label="Loading business details"
          className="flex flex-col gap-4"
          role="status"
        >
          {FIELDS.map(({ field }) => (
            <Skeleton className="h-[54px] w-full" key={field} />
          ))}
        </div>
      ) : settings.isError ? (
        <ErrorState
          error={settings.error}
          onRetry={() => void settings.refetch()}
          title="Business details didn't load."
        />
      ) : (
        // Re-mounts after a save, so the form always starts from what the API holds.
        <BusinessDetailsForm key={settings.data.updatedAt} settings={settings.data} />
      )}
    </Blueprint>
  );
}

function BusinessDetailsForm({ settings }: { settings: BusinessSettings }) {
  const canEdit = useCan("settings:edit");
  const update = useUpdateBusinessSettings();
  const [draft, setDraft] = useState({
    name: settings.name,
    phone: settings.phone,
    address: settings.address,
    receiptFooter: settings.receiptFooter,
    requirePaymentConfirmation: settings.requirePaymentConfirmation,
  });
  const [errors, setErrors] = useState<Partial<Record<TextField | "form", string>>>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = updateBusinessSettingsSchema.safeParse(draft);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (
          field === "name" ||
          field === "phone" ||
          field === "address" ||
          field === "receiptFooter"
        ) {
          next[field] ??= issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});
    update.mutate(parsed.data, {
      onSuccess: ({ message }) => toast(message || "Business details saved"),
      onError: (cause) => setErrors({ form: errorMessage(cause) }),
    });
  }

  return (
    <form className="flex flex-col gap-3.5" noValidate onSubmit={submit}>
      {FIELDS.map(({ field, label, maxLength, autoComplete }) => (
        <Field error={errors[field]} key={field} label={label}>
          {(props) => (
            <Input
              {...props}
              autoComplete={autoComplete}
              disabled={!canEdit}
              maxLength={maxLength}
              onChange={(event) => {
                setDraft((current) => ({ ...current, [field]: event.target.value }));
                setErrors({});
              }}
              value={draft[field]}
            />
          )}
        </Field>
      ))}
      <div className="flex flex-col">
        <p className="mb-[5px] text-[12px] text-neutral-700">Currency</p>
        <p className="py-1.5 text-[14px]">Nigerian naira (₦, NGN) · whole naira, no kobo</p>
      </div>
      <Switch
        checked={draft.requirePaymentConfirmation}
        description="The desk records transfers and POS payments; it doesn't verify them. The tick makes the cashier check before saving."
        disabled={!canEdit}
        label="Require payment confirmation for transfers and POS"
        onCheckedChange={(requirePaymentConfirmation) =>
          setDraft((current) => ({ ...current, requirePaymentConfirmation }))
        }
      />
      {errors.form ? (
        <p className="border border-text px-3 py-2.5 text-[13px]" role="alert">
          {errors.form}
        </p>
      ) : null}
      {canEdit ? (
        <Button className="self-start" loading={update.isPending} type="submit">
          Save details
        </Button>
      ) : null}
    </form>
  );
}
