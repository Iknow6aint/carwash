import { z } from "zod";

/** Shared contract types (carwash-api/docs/api/README.md § Shared types). */

/** 24-char hex Mongo ObjectId. */
export const idSchema = z.string().regex(/^[0-9a-f]{24}$/i, "Expected a 24-character id.");

/** ISO 8601 UTC, e.g. "2026-10-19T09:30:00.000Z". */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** "YYYY-MM-DD" in Africa/Lagos. */
export const businessDateSchema = z.iso.date();

/** Integer minor units (₦1 = 100 kobo), never negative. */
export const koboSchema = z.number().int().nonnegative();

/** Integer kobo that may be negative (e.g. a net adjustment). */
export const signedKoboSchema = z.number().int();

export const countSchema = z.number().int().nonnegative();

export const roleSchema = z.enum(["admin", "cashier"]);
export type Role = z.output<typeof roleSchema>;

export const pageInfoSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: countSchema,
  totalPages: countSchema,
});
export type PageInfo = z.output<typeof pageInfoSchema>;

/** `Page<T>` = `{ items: T[]; pageInfo }`. */
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), pageInfo: pageInfoSchema });
}
