"use client";

import { useState, type FormEvent } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { Blueprint } from "@/components/ui/blueprint";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/api-error";
import { koboToNaira, nairaToKobo, parseNairaInput } from "@/lib/format/money";

import { usePlatformSettings, useUpdatePlatformSettings } from "../hooks/use-platform";
import { updatePlatformSettingsSchema, type PlatformSettings } from "../schemas/platform.schema";

/** Platform fees, payout limits and permanent-account checks. */
export function PlatformSettingsView() {
  const settings = usePlatformSettings();
  return (
    <Blueprint as="section" className="flex max-w-[760px] flex-col gap-4 p-5 sm:p-7">
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-[25px]">Platform settings</h2>
        <p className="text-[13px] text-neutral-700">
          Fees are calculated from these values. No money is moved by the API.
        </p>
      </div>
      {settings.isPending ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading settings">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : settings.isError ? (
        <ErrorState
          error={settings.error}
          onRetry={() => void settings.refetch()}
          title="Platform settings didn't load."
        />
      ) : (
        <SettingsForm key={settings.data.updatedAt} settings={settings.data} />
      )}
    </Blueprint>
  );
}

type MoneyField = "transactionFee" | "feeCap" | "withdrawalFee" | "holdAbove" | "dailyLimit";

const MONEY_FIELDS: ReadonlyArray<{ field: MoneyField; label: string; hint?: string }> = [
  { field: "transactionFee", label: "Fee per paid sale (₦)", hint: "Default ₦100." },
  { field: "feeCap", label: "Cap per sale (₦)", hint: "0 means no cap." },
  { field: "withdrawalFee", label: "Withdrawal fee (₦)" },
  { field: "holdAbove", label: "Hold withdrawals above (₦)" },
  { field: "dailyLimit", label: "Daily withdrawal limit (₦)" },
];

function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const update = useUpdatePlatformSettings();
  const [draft, setDraft] = useState({
    transactionFee: String(koboToNaira(settings.transactionFeeKobo)),
    feeCap: String(koboToNaira(settings.feeCapKobo)),
    withdrawalFee: String(koboToNaira(settings.withdrawalFeeKobo)),
    holdAbove: String(koboToNaira(settings.holdAboveKobo)),
    dailyLimit: String(koboToNaira(settings.dailyWithdrawalLimitKobo)),
    feePayer: settings.feePayer,
    withdrawalsPerDay: String(settings.withdrawalsPerDay),
    newBankHoldHours: String(settings.newBankHoldHours),
    staticRequirements: settings.staticRequirements,
  });
  const [errors, setErrors] = useState<Partial<Record<MoneyField | "form", string>>>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    const money: Partial<Record<MoneyField, number>> = {};
    for (const { field } of MONEY_FIELDS) {
      const naira = parseNairaInput(draft[field]);
      if (naira === null) next[field] = "Enter a whole naira amount.";
      else money[field] = nairaToKobo(naira);
    }
    const perDay = parseNairaInput(draft.withdrawalsPerDay);
    const holdHours = parseNairaInput(draft.newBankHoldHours);
    if (perDay === null) next.form = "Enter how many withdrawals are allowed per day.";
    if (holdHours === null) next.form = "Enter the hold hours as a whole number.";
    if (Object.keys(next).length || perDay === null || holdHours === null) {
      setErrors(next);
      return;
    }
    const parsed = updatePlatformSettingsSchema.safeParse({
      transactionFeeKobo: money.transactionFee,
      feeCapKobo: money.feeCap,
      withdrawalFeeKobo: money.withdrawalFee,
      holdAboveKobo: money.holdAbove,
      dailyWithdrawalLimitKobo: money.dailyLimit,
      feePayer: draft.feePayer,
      withdrawalsPerDay: perDay,
      newBankHoldHours: holdHours,
      staticRequirements: draft.staticRequirements,
    });
    if (!parsed.success) {
      setErrors({ form: parsed.error.issues[0]?.message ?? "Check the settings." });
      return;
    }
    setErrors({});
    update.mutate(parsed.data, {
      onSuccess: ({ message }) => toast(message || "Platform settings saved"),
      onError: (cause) => setErrors({ form: errorMessage(cause) }),
    });
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={submit}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {MONEY_FIELDS.map(({ field, label, hint }) => (
          <Field error={errors[field]} hint={hint} key={field} label={label}>
            {(props) => (
              <Input
                {...props}
                inputMode="numeric"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, [field]: event.target.value }));
                  setErrors({});
                }}
                value={draft[field]}
              />
            )}
          </Field>
        ))}
        <Field label="Fee paid by">
          {(props) => (
            <Select
              {...props}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  feePayer: event.target.value as PlatformSettings["feePayer"],
                }))
              }
              value={draft.feePayer}
            >
              <option value="customer">Customer</option>
              <option value="business">Business</option>
            </Select>
          )}
        </Field>
        <Field label="Withdrawals per 24 hours">
          {(props) => (
            <Input
              {...props}
              inputMode="numeric"
              onChange={(event) =>
                setDraft((current) => ({ ...current, withdrawalsPerDay: event.target.value }))
              }
              value={draft.withdrawalsPerDay}
            />
          )}
        </Field>
        <Field label="Block new bank for (hours)">
          {(props) => (
            <Input
              {...props}
              inputMode="numeric"
              onChange={(event) =>
                setDraft((current) => ({ ...current, newBankHoldHours: event.target.value }))
              }
              value={draft.newBankHoldHours}
            />
          )}
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="m-0">Permanent account checks</h3>
        <p className="text-[13px] text-neutral-700">
          A business needs these before a permanent account number is issued. Per-transaction
          accounts work without them.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {(
            [
              ["bvn", "Owner BVN", "Name on the BVN matches the owner."],
              ["photo", "Photo of the car wash", "Signboard or wash bays, taken in the app."],
              ["bank", "Settlement account in the owner's name", "Withdrawals go to this account."],
              ["volume", "At least 50 confirmed payments", "Shows the business is trading."],
            ] as const
          ).map(([key, label, description]) => (
            <Switch
              checked={draft.staticRequirements[key]}
              description={description}
              key={key}
              label={label}
              onCheckedChange={(checked) =>
                setDraft((current) => ({
                  ...current,
                  staticRequirements: { ...current.staticRequirements, [key]: checked },
                }))
              }
            />
          ))}
        </div>
      </div>

      {errors.form ? (
        <p className="border border-text px-3 py-2.5 text-[13px]" role="alert">
          {errors.form}
        </p>
      ) : null}
      <Button className="self-start" loading={update.isPending} type="submit">
        Save settings
      </Button>
    </form>
  );
}
