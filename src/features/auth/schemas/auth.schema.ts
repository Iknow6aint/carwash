import { z } from "zod";

import { idSchema, isoDateTimeSchema, roleSchema } from "@/lib/api/schema-helpers";

/** auth.md — `User`. */
export const userSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  email: z.string().min(1),
  role: roleSchema,
  isActive: z.boolean(),
  /** True after an admin sets a temporary password. */
  mustChangePassword: z.boolean(),
  lastLoginAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type User = z.output<typeof userSchema>;

/** auth.md — `AuthSession` (login, refresh, password change). */
export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: isoDateTimeSchema,
  refreshToken: z.string().min(1),
  refreshTokenExpiresAt: isoDateTimeSchema,
  user: userSchema,
});
export type AuthSession = z.output<typeof authSessionSchema>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sign-in form. Messages follow the prototype. */
export const loginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email.")
    .refine((value) => EMAIL_PATTERN.test(value), "Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});
export type LoginInput = z.input<typeof loginInputSchema>;

/** `POST /auth/password`: `newPassword` 8–128 chars and different from the current one. */
export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Use 128 characters or fewer."),
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: "Choose a password different from the current one.",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.input<typeof changePasswordInputSchema>;
