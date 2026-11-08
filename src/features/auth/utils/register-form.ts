import { registerInputSchema, type RegisterInput } from "../schemas/auth.schema";

import type { RegisterState, RegisterValues } from "./form-state";

const FIELDS = [
  "businessName",
  "businessPhone",
  "businessAddress",
  "name",
  "email",
  "password",
] as const satisfies ReadonlyArray<keyof RegisterInput>;

type FieldName = (typeof FIELDS)[number];

function text(formData: FormData, field: FieldName): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

/**
 * Reads and validates the registration form (`POST /auth/register` body).
 *
 * @returns The body to send, or one error per field (first message wins). `values` always holds
 * what was typed, without the password, so the form can refill itself.
 */
export function parseRegisterForm(
  formData: FormData,
): { ok: true; input: RegisterInput; values: RegisterValues } | ({ ok: false } & RegisterState) {
  const values: RegisterValues = {
    businessName: text(formData, "businessName"),
    businessPhone: text(formData, "businessPhone"),
    businessAddress: text(formData, "businessAddress"),
    name: text(formData, "name"),
    email: text(formData, "email"),
  };
  const parsed = registerInputSchema.safeParse({
    ...values,
    // Optional on the API: a blank address is left out rather than sent empty.
    businessAddress: values.businessAddress.trim() || undefined,
    password: text(formData, "password"),
  });
  if (parsed.success) return { ok: true, input: parsed.data, values };

  const errors: RegisterState["errors"] = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && (FIELDS as readonly string[]).includes(field)) {
      errors[field as FieldName] ??= issue.message;
    }
  }
  return { ok: false, errors, values };
}

/**
 * Places an API refusal: a taken email belongs to the email field, everything else (validation
 * the form missed, rate limiting, the API being down) goes above the button.
 */
export function registerErrorsFromApi(error: {
  code?: string;
  message: string;
}): RegisterState["errors"] {
  return error.code === "EMAIL_TAKEN" ? { email: error.message } : { form: error.message };
}
