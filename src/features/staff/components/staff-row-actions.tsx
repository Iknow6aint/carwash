"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/api-error";
import { ROLE_LABELS } from "@/lib/auth/access";

import { useResetStaffPassword, useSetStaffActive, useUpdateStaff } from "../hooks/use-staff";
import { resetPasswordSchema, type StaffMember } from "../schemas/staff.schema";

type Action = "role" | "deactivate" | "reactivate" | "reset";

/**
 * Admin actions for one staff member: change role, reset password, deactivate or reactivate.
 * Each asks first (they all sign the person out) and shows the API's message if it is refused,
 * e.g. "There must always be at least one active admin."
 */
export function StaffRowActions({ member, isSelf }: { member: StaffMember; isSelf: boolean }) {
  const [action, setAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const updateStaff = useUpdateStaff();
  const setActive = useSetStaffActive();
  const resetPassword = useResetStaffPassword();

  const otherRole = member.role === "admin" ? "cashier" : "admin";
  const pending = updateStaff.isPending || setActive.isPending || resetPassword.isPending;

  function open(next: Action) {
    setError(null);
    setPasswordError(undefined);
    setTemporaryPassword("");
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
    if (action === "role")
      updateStaff.mutate({ id: member.id, input: { role: otherRole } }, handlers);
    if (action === "deactivate") setActive.mutate({ id: member.id, active: false }, handlers);
    if (action === "reactivate") setActive.mutate({ id: member.id, active: true }, handlers);
    if (action === "reset") {
      const parsed = resetPasswordSchema.safeParse({ temporaryPassword });
      if (!parsed.success) {
        setPasswordError(parsed.error.issues[0]?.message);
        return;
      }
      resetPassword.mutate(
        { id: member.id, temporaryPassword: parsed.data.temporaryPassword },
        handlers,
      );
    }
  }

  const dialog: Record<Action, { title: string; description: string; confirmLabel: string }> = {
    role: {
      title: `Make ${member.name} ${ROLE_LABELS[otherRole].toLowerCase()}?`,
      description:
        otherRole === "admin"
          ? "Admins manage prices, staff and business details and can cancel transactions. They are signed out and sign in again with the new role."
          : "They keep recording payments but lose admin tools. They are signed out and sign in again with the new role.",
      confirmLabel: `Make ${ROLE_LABELS[otherRole].toLowerCase()}`,
    },
    deactivate: {
      title: `Deactivate ${member.name}?`,
      description:
        "They are signed out at once and can't sign in until reactivated. Their past sales stay on record.",
      confirmLabel: "Deactivate",
    },
    reactivate: {
      title: `Reactivate ${member.name}?`,
      description: "They can sign in again with their current password.",
      confirmLabel: "Reactivate",
    },
    reset: {
      title: `Reset ${member.name}'s password`,
      description:
        "Set a temporary password and tell it to them. They choose their own at the next sign-in.",
      confirmLabel: "Set temporary password",
    },
  };
  const current = action ? dialog[action] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label={`Actions for ${member.name}`} size="sm" variant="ghost">
            Manage
            <ChevronDown aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => open("role")}>
            Make {ROLE_LABELS[otherRole].toLowerCase()}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => open("reset")}>Reset password</DropdownMenuItem>
          {member.isActive ? (
            isSelf ? null : (
              <DropdownMenuItem onSelect={() => open("deactivate")}>Deactivate</DropdownMenuItem>
            )
          ) : (
            <DropdownMenuItem onSelect={() => open("reactivate")}>Reactivate</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {current ? (
        <ConfirmDialog
          cancelLabel="Keep as is"
          confirmLabel={current.confirmLabel}
          description={current.description}
          error={error}
          onConfirm={confirm}
          onOpenChange={(next) => (next ? undefined : setAction(null))}
          open={action !== null}
          pending={pending}
          title={current.title}
        >
          {action === "reset" ? (
            <Field error={passwordError} hint="At least 8 characters." label="Temporary password">
              {(props) => (
                <Input
                  {...props}
                  autoComplete="new-password"
                  onChange={(event) => setTemporaryPassword(event.target.value)}
                  type="password"
                  value={temporaryPassword}
                />
              )}
            </Field>
          ) : null}
        </ConfirmDialog>
      ) : null}
    </>
  );
}
