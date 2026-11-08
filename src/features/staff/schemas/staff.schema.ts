import { z } from "zod";

import { userSchema } from "@/features/auth/schemas/auth.schema";
import { countSchema, staffRoleSchema } from "@/lib/api/schema-helpers";

/**
 * staff.md — `StaffMember` = `User` + today's paid count (Lagos). Only the caller's business's
 * staff, so the role is always a staff role (never `super_admin`).
 */
export const staffMemberSchema = userSchema.extend({
  role: staffRoleSchema,
  todayCount: countSchema,
});
export type StaffMember = z.output<typeof staffMemberSchema>;

/** `GET /staff`: active first, then by name. */
export const staffListSchema = z.array(staffMemberSchema);

const temporaryPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use 128 characters or fewer.");

/** `POST /staff` body (admin). */
export const addStaffSchema = z.object({
  name: z.string().trim().min(1, "Enter their name.").max(80, "Use 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter their email.")
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email."),
  role: staffRoleSchema,
  temporaryPassword: temporaryPasswordSchema,
});
export type AddStaffInput = z.input<typeof addStaffSchema>;

/** `PATCH /staff/:id` body (admin). */
export const updateStaffSchema = z
  .object({
    name: z.string().trim().min(1, "Enter their name.").max(80, "Use 80 characters or fewer."),
    role: staffRoleSchema,
  })
  .partial();
export type UpdateStaffInput = z.input<typeof updateStaffSchema>;

/** `POST /staff/:id/reset-password` body (admin). */
export const resetPasswordSchema = z.object({ temporaryPassword: temporaryPasswordSchema });
