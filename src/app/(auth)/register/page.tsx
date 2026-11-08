import type { Metadata } from "next";

import { AuthFrame } from "@/features/auth/components/auth-frame";
import { RegisterForm } from "@/features/auth/components/register-form";
import { redirectIfSignedIn } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Register your car wash" };

/** Public: a new car wash registers itself and its owner. Signed-in visitors go on as usual. */
export default async function RegisterPage() {
  await redirectIfSignedIn(null);
  return (
    <AuthFrame>
      <RegisterForm />
    </AuthFrame>
  );
}
