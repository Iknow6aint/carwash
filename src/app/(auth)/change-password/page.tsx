import type { Metadata } from "next";

import { AuthFrame } from "@/features/auth/components/auth-frame";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { homePathForRole } from "@/lib/auth/return-to";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Change password" };

/** Needs a session but sits outside the desk shell: a temporary password comes first. */
export default async function ChangePasswordPage() {
  const user = await requireUser();
  return (
    <AuthFrame>
      <ChangePasswordForm
        homePath={homePathForRole(user.role)}
        mustChange={user.mustChangePassword}
      />
    </AuthFrame>
  );
}
