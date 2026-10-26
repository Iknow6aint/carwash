import type { Metadata } from "next";

import { AuthFrame } from "@/features/auth/components/auth-frame";
import { LoginForm } from "@/features/auth/components/login-form";
import { safeReturnTo } from "@/lib/auth/return-to";
import { redirectIfSignedIn } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).returnTo;
  const returnTo = safeReturnTo(Array.isArray(raw) ? raw[0] : raw);
  await redirectIfSignedIn(returnTo);
  return (
    <AuthFrame>
      <LoginForm returnTo={returnTo} />
    </AuthFrame>
  );
}
