"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/services/auth.service";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="self-start px-0" loading={pending} type="submit" variant="ghost">
      Sign out
    </Button>
  );
}

/**
 * Posts to the `signOut` Server Action (revoke the refresh session, clear cookies, back to
 * /login). The sign-in page clears cached data, so the next person on the tablet starts clean.
 */
export function SignOutButton() {
  return (
    <form action={signOut} className="mt-1">
      <SubmitButton />
    </form>
  );
}
