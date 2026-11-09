"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";

import { FormErrors } from "@/components/feedback/form-errors";
import { Corners } from "@/components/ui/blueprint";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getQueryClient } from "@/lib/api/query-client";
import { LOGIN_PATH } from "@/lib/auth/return-to";

import { registerBusiness } from "../services/auth.service";
import { initialRegisterState } from "../utils/form-state";

import { AuthHeading } from "./auth-frame";

/**
 * Register a car wash: the business details printed on receipts, then the owner's account. Posted
 * to the `registerBusiness` Server Action (works without JavaScript too), which signs the owner in
 * and sends them to wait for approval. Errors sit under their field; a taken email under Email.
 */
export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerBusiness, initialRegisterState);
  const { errors, values } = state;

  // A tablet is shared: never show the previous person's cached data to the next one.
  useEffect(() => {
    getQueryClient().clear();
  }, []);

  return (
    <div className="flex w-[min(440px,100%)] flex-col gap-4">
      <form
        action={formAction}
        className="blueprint flex flex-col gap-3.5 border border-divider p-5 sm:p-7"
        noValidate
      >
        <Corners />
        <AuthHeading
          description="We check every new car wash before its desk opens. You can sign in straight away."
          title="Register your car wash"
        />

        <p className="mt-1.5 kicker">Your car wash</p>
        <Field error={errors.businessName} hint="Printed on every receipt." label="Business name">
          {(props) => (
            <Input
              {...props}
              autoComplete="organization"
              defaultValue={values.businessName}
              inputSize="lg"
              key={`businessName:${values.businessName}`}
              maxLength={80}
              name="businessName"
            />
          )}
        </Field>
        <Field error={errors.businessPhone} label="Phone">
          {(props) => (
            <Input
              {...props}
              autoComplete="tel"
              defaultValue={values.businessPhone}
              inputMode="tel"
              inputSize="lg"
              key={`businessPhone:${values.businessPhone}`}
              maxLength={30}
              name="businessPhone"
              type="tel"
            />
          )}
        </Field>
        <Field error={errors.businessAddress} label="Address" optional>
          {(props) => (
            <Input
              {...props}
              autoComplete="street-address"
              defaultValue={values.businessAddress}
              inputSize="lg"
              key={`businessAddress:${values.businessAddress}`}
              maxLength={160}
              name="businessAddress"
            />
          )}
        </Field>

        <p className="mt-1.5 kicker">Your account</p>
        <Field error={errors.name} label="Your name">
          {(props) => (
            <Input
              {...props}
              autoComplete="name"
              defaultValue={values.name}
              inputSize="lg"
              key={`name:${values.name}`}
              maxLength={80}
              name="name"
            />
          )}
        </Field>
        <Field error={errors.email} hint="You sign in with this." label="Email">
          {(props) => (
            <Input
              {...props}
              autoComplete="email"
              defaultValue={values.email}
              inputMode="email"
              inputSize="lg"
              key={`email:${values.email}`}
              name="email"
              type="email"
            />
          )}
        </Field>
        <Field error={errors.password} hint="At least 8 characters." label="Password">
          {(props) => (
            <PasswordInput {...props} autoComplete="new-password" inputSize="lg" name="password" />
          )}
        </Field>

        <FormErrors errors={errors.form ? [errors.form] : []} />
        <Button className="mt-1.5" loading={pending} marks size="xl" type="submit">
          Register business
        </Button>
      </form>
      <p className="text-center text-[14px] text-neutral-700">
        Already registered?{" "}
        <Link className={buttonVariants({ variant: "ghost" })} href={LOGIN_PATH}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
