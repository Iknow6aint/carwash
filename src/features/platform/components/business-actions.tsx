"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/api-error";

import {
  useApproveBusiness,
  useReactivateBusiness,
  useSuspendBusiness,
} from "../hooks/use-platform";
import { suspendBusinessSchema, type PlatformBusiness } from "../schemas/platform.schema";
import { businessActions, type BusinessAction } from "../utils/business-status";

interface ActionCopy {
  /** The button on the page. */
  label: string;
  title: string;
  description: string;
  /** The dialog's confirm button. */
  confirmLabel: string;
  /** Approve and reactivate are the page's main action: solid. The rest: ink-bordered. */
  primary: boolean;
  needsReason: boolean;
}

function actionCopy(action: BusinessAction, name: string): ActionCopy {
  switch (action) {
    case "approve":
      return {
        label: "Approve business",
        title: `Approve ${name}?`,
        description: "Its staff can use the desk straight away.",
        confirmLabel: "Approve business",
        primary: true,
        needsReason: false,
      };
    case "decline":
      return {
        label: "Decline registration",
        title: `Decline ${name}?`,
        description:
          "The owner is told the business is suspended and can't use the desk. You can reactivate it later.",
        confirmLabel: "Decline registration",
        primary: false,
        needsReason: true,
      };
    case "suspend":
      return {
        label: "Suspend business",
        title: `Suspend ${name}?`,
        description:
          "Its staff lose access to the desk at once. Their accounts and sales stay on record.",
        confirmLabel: "Suspend business",
        primary: false,
        needsReason: true,
      };
    case "reactivate":
      return {
        label: "Reactivate business",
        title: `Reactivate ${name}?`,
        description: "Its staff can use the desk again with their current passwords.",
        confirmLabel: "Reactivate business",
        primary: true,
        needsReason: false,
      };
  }
}

/**
 * The super admin's actions for one business, only those its status allows (platform.md):
 * pending → approve or decline, active → suspend, suspended → reactivate. Each asks first;
 * declining and suspending need a reason that stays on the record. A refusal (for example
 * another super admin got there first) shows inside the dialog.
 */
export function BusinessActions({ business }: { business: PlatformBusiness }) {
  const [action, setAction] = useState<BusinessAction | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const approve = useApproveBusiness();
  const suspend = useSuspendBusiness();
  const reactivate = useReactivateBusiness();
  const pending = approve.isPending || suspend.isPending || reactivate.isPending;

  function open(next: BusinessAction) {
    setReason("");
    setReasonError(undefined);
    setError(null);
    setAction(next);
  }

  const handlers = {
    onSuccess: ({ message }: { message: string }) => {
      toast(message);
      setAction(null);
    },
    onError: (cause: unknown) => setError(errorMessage(cause)),
  };

  function confirm() {
    setError(null);
    if (action === "approve") approve.mutate(business.id, handlers);
    if (action === "reactivate") reactivate.mutate(business.id, handlers);
    if (action === "decline" || action === "suspend") {
      const parsed = suspendBusinessSchema.safeParse({ reason });
      if (!parsed.success) {
        setReasonError(parsed.error.issues[0]?.message);
        return;
      }
      setReasonError(undefined);
      suspend.mutate({ id: business.id, reason: parsed.data.reason }, handlers);
    }
  }

  const current = action ? actionCopy(action, business.name) : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        {businessActions(business.status).map((next) => {
          const copy = actionCopy(next, business.name);
          return (
            <Button
              className={copy.primary ? undefined : "border-text"}
              key={next}
              onClick={() => open(next)}
              variant={copy.primary ? "primary" : "secondary"}
            >
              {copy.label}
            </Button>
          );
        })}
      </div>

      {current ? (
        <ConfirmDialog
          confirmLabel={current.confirmLabel}
          description={current.description}
          error={error}
          onConfirm={confirm}
          onOpenChange={(next) => (next ? undefined : setAction(null))}
          open={action !== null}
          pending={pending}
          title={current.title}
        >
          {current.needsReason ? (
            <Field error={reasonError} hint="Give a reason. It stays on the record." label="Reason">
              {(props) => (
                <Input
                  {...props}
                  autoFocus
                  maxLength={200}
                  onChange={(event) => setReason(event.target.value)}
                  value={reason}
                />
              )}
            </Field>
          ) : null}
        </ConfirmDialog>
      ) : null}
    </>
  );
}
