import { z } from "zod";

import { isoDateTimeSchema } from "@/lib/api/schema-helpers";

/** settings.md — `BusinessSettings`. Printed on every receipt. */
export const businessSettingsSchema = z.object({
  name: z.string().min(1),
  phone: z.string(),
  address: z.string(),
  receiptFooter: z.string(),
  currency: z.literal("NGN"),
  requirePaymentConfirmation: z.boolean(),
  updatedAt: isoDateTimeSchema,
});
export type BusinessSettings = z.output<typeof businessSettingsSchema>;

/** `PATCH /settings/business` body (admin). Lengths from the contract. */
export const updateBusinessSettingsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter the business name.")
      .max(80, "Use 80 characters or fewer."),
    phone: z.string().trim().max(30, "Use 30 characters or fewer."),
    address: z.string().trim().max(160, "Use 160 characters or fewer."),
    receiptFooter: z.string().trim().max(120, "Use 120 characters or fewer."),
    requirePaymentConfirmation: z.boolean(),
  })
  .partial();
export type UpdateBusinessSettingsInput = z.input<typeof updateBusinessSettingsSchema>;
