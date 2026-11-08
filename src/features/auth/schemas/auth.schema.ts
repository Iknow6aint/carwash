import { z } from "zod";

import {
  businessStatusSchema,
  idSchema,
  isoDateTimeSchema,
  roleSchema,
} from "@/lib/api/schema-helpers";

/** auth.md — `User`. */
export const userSchema = z.object({
  id: idSchema,
  /** The business the account belongs to; null only for super admins. */
  businessId: idSchema.nullable(),
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

/** auth.md — `BusinessSummary`: enough to decide whether the desk is open. */
export const businessSummarySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  status: businessStatusSchema,
});
export type BusinessSummary = z.output<typeof businessSummarySchema>;

/** auth.md — `SessionUser`: the signed-in account (`GET /auth/me`, every `AuthSession`). */
export const sessionUserSchema = userSchema.extend({
  /** Null only for super admins. */
  business: businessSummarySchema.nullable(),
});
export type SessionUser = z.output<typeof sessionUserSchema>;

/** auth.md — `AuthSession` (login, register, refresh, password change). */
export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: isoDateTimeSchema,
  refreshToken: z.string().min(1),
  refreshTokenExpiresAt: isoDateTimeSchema,
  user: sessionUserSchema,
});
export type AuthSession = z.output<typeof authSessionSchema>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trimmed, lowercased email, as the API stores it. */
const emailSchema = (maxLength = 254) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email.")
    .max(maxLength, `Use ${maxLength} characters or fewer.`)
    .refine((value) => EMAIL_PATTERN.test(value), "Enter a valid email.");

/** Sign-in form. Messages follow the prototype. */
export const loginInputSchema = z.object({
  email: emailSchema(),
  password: z.string().min(1, "Enter your password."),
});
export type LoginInput = z.input<typeof loginInputSchema>;

const newPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use 128 characters or fewer.");

/** `POST /auth/password`: `newPassword` 8–128 chars and different from the current one. */
export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: newPasswordSchema,
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: "Choose a password different from the current one.",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.input<typeof changePasswordInputSchema>;

/** `POST /auth/register`: a car wash and its owner. Limits match auth.md. */
export const registerInputSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Enter your business name.")
    .max(80, "Use 80 characters or fewer."),
  businessPhone: z
    .string()
    .trim()
    .min(1, "Enter a phone number.")
    .max(30, "Use 30 characters or fewer."),
  businessAddress: z.string().trim().max(160, "Use 160 characters or fewer.").optional(),
  name: z.string().trim().min(1, "Enter your name.").max(80, "Use 80 characters or fewer."),
  email: emailSchema(120),
  password: newPasswordSchema,
});
export type RegisterInput = z.input<typeof registerInputSchema>;
export type RegisterField = keyof RegisterInput;
