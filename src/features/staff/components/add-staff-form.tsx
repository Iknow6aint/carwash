"use client";

import { useState, type FormEvent } from "react";

import { Blueprint } from "@/components/ui/blueprint";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ApiError, errorMessage } from "@/lib/api/api-error";
import type { Role } from "@/lib/api/schema-helpers";

import { useAddStaff } from "../hooks/use-staff";
import { addStaffSchema } from "../schemas/staff.schema";

interface Draft {
  name: string;
  email: string;
  role: Role;
  temporaryPassword: string;
}

type DraftErrors = Partial<Record<keyof Draft | "form", string>>;

const BLANK: Draft = { name: "", email: "", role: "cashier", temporaryPassword: "" };

/** Admin: add a staff member with a temporary password they change at first sign-in. */
export function AddStaffForm() {
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [errors, setErrors] = useState<DraftErrors>({});
  const add = useAddStaff();

  function change<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = addStaffSchema.safeParse(draft);
    if (!parsed.success) {
      const next: DraftErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in BLANK)
          next[field as keyof Draft] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    add.mutate(parsed.data, {
      onSuccess: ({ data, message }) => {
        toast(message || `${data.name} can now sign in`);
        setDraft(BLANK);
      },
      onError: (cause) => {
        if (cause instanceof ApiError && cause.code === "EMAIL_TAKEN")
          setErrors({ email: cause.message });
        else setErrors({ form: errorMessage(cause) });
      },
    });
  }

  return (
    <Blueprint as="section" aria-label="Add staff" className="p-3.5">
      <form className="flex flex-wrap items-start gap-2.5" noValidate onSubmit={submit}>
        <Field className="flex-[1_1_160px]" error={errors.name} label="Name">
          {(props) => (
            <Input
              {...props}
              autoComplete="off"
              maxLength={80}
              onChange={(event) => change("name", event.target.value)}
              value={draft.name}
            />
          )}
        </Field>
        <Field className="flex-[1_1_180px]" error={errors.email} label="Email">
          {(props) => (
            <Input
              {...props}
              autoComplete="off"
              inputMode="email"
              onChange={(event) => change("email", event.target.value)}
              type="email"
              value={draft.email}
            />
          )}
        </Field>
        <Field className="flex-[0_1_130px]" label="Role">
          {(props) => (
            <Select
              {...props}
              onChange={(event) => change("role", event.target.value as Role)}
              value={draft.role}
            >
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </Select>
          )}
        </Field>
        <Field
          className="flex-[1_1_180px]"
          error={errors.temporaryPassword}
          hint="They choose their own when they first sign in."
          label="Temporary password"
        >
          {(props) => (
            <Input
              {...props}
              autoComplete="new-password"
              onChange={(event) => change("temporaryPassword", event.target.value)}
              type="password"
              value={draft.temporaryPassword}
            />
          )}
        </Field>
        <Button className="mt-[22px]" loading={add.isPending} type="submit">
          Add staff
        </Button>
        {errors.form ? (
          <p className="basis-full text-[13px]" role="alert">
            {errors.form}
          </p>
        ) : null}
      </form>
    </Blueprint>
  );
}
