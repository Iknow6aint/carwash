"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";

import { FormErrors } from "@/components/feedback/form-errors";
import { Corners } from "@/components/ui/blueprint";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getQueryClient } from "@/lib/api/query-client";
import { REGISTER_PATH } from "@/lib/auth/return-to";

import { signIn } from "../services/auth.service";
import { initialSignInState } from "../utils/form-state";

import { AuthHeading } from "./auth-frame";

/**
 * Sign in: email and password, posted to the `signIn` Server Action (works without JavaScript
 * too). The action sets HttpOnly cookies and redirects by role; errors are the API's own copy. A
 * new car wash registers from the link underneath.
 */
export function LoginForm({ returnTo }: { returnTo?: string | null }) {
  const [state, formAction, pending] = useActionState(signIn, initialSignInState);

  // A tablet is shared: never show the previous person's cached data to the next one.
  useEffect(() => {
    getQueryClient().clear();
  }, []);

  return (
    <div className="flex w-[min(400px,100%)] flex-col gap-4">
      <form
        action={formAction}
        className="blueprint flex flex-col gap-3.5 border border-divider p-5 sm:p-7"
        noValidate
      >
        <Corners />
        <AuthHeading description="Use the email your admin added you with." title="Sign in" />
        {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
        <Field label="Email">
          {(props) => (
            <Input
              {...props}
              autoComplete="email"
              defaultValue={state.email}
              inputMode="email"
              inputSize="lg"
              key={state.email}
              name="email"
              placeholder="you@cartorywash.ng"
              type="email"
            />
          )}
        </Field>
        <Field label="Password">
          {(props) => (
            <Input
              {...props}
              autoComplete="current-password"
              inputSize="lg"
              name="password"
              type="password"
            />
          )}
        </Field>
        <FormErrors errors={state.error ? [state.error] : []} />
        <Button className="mt-1.5" loading={pending} marks size="xl" type="submit">
          Sign in
        </Button>
      </form>
      <p className="text-center text-[14px] text-neutral-700">
        New car wash?{" "}
        <Link className={buttonVariants({ variant: "ghost" })} href={REGISTER_PATH}>
          Register your business
        </Link>
      </p>
    </div>
  );
}
