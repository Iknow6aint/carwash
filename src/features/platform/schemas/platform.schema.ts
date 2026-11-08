import { z } from "zod";

import {
  businessStatusSchema,
  countSchema,
  idSchema,
  isoDateTimeSchema,
  koboSchema,
  pageSchema,
} from "@/lib/api/schema-helpers";

/** Paid figures over the Lagos `30d` range. */
const last30DaysSchema = z.object({
  carsWashed: countSchema,
  revenueKobo: koboSchema,
});

/** platform.md — `PlatformBusiness`: one business with its summary figures. */
export const platformBusinessSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  phone: z.string(),
  address: z.string(),
  status: businessStatusSchema,
  /** Why it was suspended; null unless suspended. */
  statusReason: z.string().nullable(),
  statusChangedAt: isoDateTimeSchema.nullable(),
  approvedAt: isoDateTimeSchema.nullable(),
  /** The owner, as registered. */
  registeredBy: z.object({ id: idSchema, name: z.string().min(1), email: z.string().min(1) }),
  createdAt: isoDateTimeSchema,
  activeStaffCount: countSchema,
  last30Days: last30DaysSchema,
  lastSaleAt: isoDateTimeSchema.nullable(),
});
export type PlatformBusiness = z.output<typeof platformBusinessSchema>;

/** `GET /platform/businesses`: newest registration first. */
export const platformBusinessPageSchema = pageSchema(platformBusinessSchema);
export type PlatformBusinessPage = z.output<typeof platformBusinessPageSchema>;

/** platform.md — `PlatformOverview`. */
export const platformOverviewSchema = z.object({
  businesses: z.object({
    total: countSchema,
    pending: countSchema,
    active: countSchema,
    suspended: countSchema,
  }),
  last30Days: last30DaysSchema,
});
export type PlatformOverview = z.output<typeof platformOverviewSchema>;

export const BUSINESS_SEARCH_MAX_LENGTH = 60;

/** `GET /platform/businesses` query. */
export const listBusinessesQuerySchema = z.object({
  status: businessStatusSchema.optional(),
  q: z
    .string()
    .trim()
    .max(BUSINESS_SEARCH_MAX_LENGTH, "Search with 60 characters or fewer.")
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(40),
});
export type ListBusinessesQuery = z.input<typeof listBusinessesQuerySchema>;

/** `POST /platform/businesses/:id/suspend` body. */
export const suspendBusinessSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Give a reason. It stays on the record.")
    .max(200, "Keep the reason to 200 characters."),
});
