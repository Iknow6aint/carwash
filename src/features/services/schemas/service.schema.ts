import { z } from "zod";

import { countSchema, idSchema, isoDateTimeSchema } from "@/lib/api/schema-helpers";

/** services.md — `Service`. */
export const serviceSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  /** Integer > 0, whole naira (multiple of 100). */
  priceKobo: z.number().int().positive(),
  isActive: z.boolean(),
  /** Tile order on New transaction, ascending. */
  sortOrder: z.number().int(),
  /** Paid transactions in the last 30 Lagos days. */
  soldLast30Days: countSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type Service = z.output<typeof serviceSchema>;

export const serviceListSchema = z.array(serviceSchema);

const nameSchema = z
  .string()
  .trim()
  .min(1, "Give the service a name.")
  .max(60, "Keep the name to 60 characters.");

const priceKoboSchema = z
  .number()
  .int()
  .min(100, "Enter a price in naira.")
  .max(100_000_000, "Enter a price up to ₦1,000,000.")
  .multipleOf(100, "Enter a price in whole naira.");

/** `POST /services` body (admin). */
export const createServiceSchema = z.object({ name: nameSchema, priceKobo: priceKoboSchema });
export type CreateServiceInput = z.input<typeof createServiceSchema>;

/** `PATCH /services/:id` body (admin). */
export const updateServiceSchema = z
  .object({
    name: nameSchema,
    priceKobo: priceKoboSchema,
    isActive: z.boolean(),
    sortOrder: z.number().int(),
  })
  .partial();
export type UpdateServiceInput = z.input<typeof updateServiceSchema>;
