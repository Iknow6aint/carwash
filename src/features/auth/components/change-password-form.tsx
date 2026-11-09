"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormErrors } from "@/components/feedback/form-errors";
import { Corners } from "@/components/ui/blueprint";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

import { changePassword, signOut } from "../services/auth.service";
import { initialChangePasswordState } from "../utils/form-state";

import { AuthHeading } from "./auth-frame";

/**
 * Change password: current and new. When an admin set a temporary password the desk sends the
 * user here before anything else; on success the API's fresh tokens replace the cookies and the
 * user lands by role.
 */
export function ChangePasswordForm({
  mustChange,
  homePath,
  homeLabel = "Back to the desk",
}: {
  mustChange: boolean;
  homePath: string;
  homeLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(changePassword, initialChangePasswordState);

  return (
    <div className="flex w-[min(400px,100%)] flex-col gap-4">
      <form
        action={formAction}
        className="blueprint flex flex-col gap-3.5 border border-divider p-5 sm:p-7"
        noValidate
      >
        <Corners />
        <AuthHeading
          description={
            mustChange
              ? "Your admin set a temporary password. Choose your own to continue."
              : "Other signed-in devices will be signed out."
          }
          title={mustChange ? "Choose a new password" : "Change password"}
        />
        <Field
          error={state.errors.currentPassword}
          hint={mustChange ? "The temporary password your admin gave you." : undefined}
          label="Current password"
        >
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="current-password"
              inputSize="lg"
              name="currentPassword"
            />
          )}
        </Field>
        <Field error={state.errors.newPassword} hint="At least 8 characters." label="New password">
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              inputSize="lg"
              name="newPassword"
            />
          )}
        </Field>
        <FormErrors errors={state.errors.form ? [state.errors.form] : []} />
        <Button className="mt-1.5" loading={pending} marks size="xl" type="submit">
          Save password
        </Button>
      </form>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {mustChange ? null : (
          <Link className={buttonVariants({ variant: "ghost" })} href={homePath}>
            {homeLabel}
          </Link>
        )}
        <form action={signOut}>
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
