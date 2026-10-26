import { z } from "zod";

import { userSchema } from "@/features/auth/schemas/auth.schema";
import { countSchema, roleSchema } from "@/lib/api/schema-helpers";

/** staff.md — `StaffMember` = `User` + today's paid count (Lagos). */
export const staffMemberSchema = userSchema.extend({
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
  role: roleSchema,
  temporaryPassword: temporaryPasswordSchema,
});
export type AddStaffInput = z.input<typeof addStaffSchema>;

/** `PATCH /staff/:id` body (admin). */
export const updateStaffSchema = z
  .object({
    name: z.string().trim().min(1, "Enter their name.").max(80, "Use 80 characters or fewer."),
    role: roleSchema,
  })
  .partial();
export type UpdateStaffInput = z.input<typeof updateStaffSchema>;

/** `POST /staff/:id/reset-password` body (admin). */
export const resetPasswordSchema = z.object({ temporaryPassword: temporaryPasswordSchema });
