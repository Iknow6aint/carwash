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
  /** Calculated from the platform fee; it is not a bank balance. */
  platformFees: z.object({
    last30DaysKobo: koboSchema,
    perTransactionKobo: koboSchema,
    payer: z.enum(["customer", "business"]),
  }),
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

/** platform.md — `PlatformTransaction`: metadata only. */
const platformPaymentMethodSchema = z.enum(["cash", "transfer", "pos"]);
const platformTransactionStatusSchema = z.enum(["paid", "cancelled"]);

export const platformTransactionSchema = z.object({
  id: idSchema,
  reference: z.string().min(1),
  business: z.object({ id: idSchema, name: z.string().min(1) }),
  amountKobo: koboSchema,
  feeKobo: koboSchema,
  method: platformPaymentMethodSchema,
  status: platformTransactionStatusSchema,
  isAdjusted: z.boolean(),
  recordedBy: z.string(),
  businessDate: z.string(),
  createdAt: isoDateTimeSchema,
});
export type PlatformTransaction = z.output<typeof platformTransactionSchema>;

export const platformTransactionPageSchema = pageSchema(platformTransactionSchema);
export type PlatformTransactionPage = z.output<typeof platformTransactionPageSchema>;

export const PLATFORM_TRANSACTION_STATUSES = ["all", "paid", "cancelled"] as const;

/** `GET /platform/transactions` query. */
export const listPlatformTransactionsQuerySchema = z.object({
  status: z.enum(PLATFORM_TRANSACTION_STATUSES).default("all"),
  method: z.enum(["all", "cash", "transfer", "pos"]).default("all"),
  q: z.string().trim().max(60).default(""),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(40),
});
export type ListPlatformTransactionsQuery = z.input<typeof listPlatformTransactionsQuerySchema>;

const revenueMonthSchema = z.object({
  month: z.string(),
  label: z.string(),
  transactions: countSchema,
  feesKobo: koboSchema,
});

export const platformRevenueSchema = z.object({
  fee: z.object({
    perTransactionKobo: koboSchema,
    capKobo: koboSchema,
    payer: z.enum(["customer", "business"]),
  }),
  totals: z.object({
    fees12MonthsKobo: koboSchema,
    transactions12Months: countSchema,
    fees30DaysKobo: koboSchema,
    transactions30Days: countSchema,
  }),
  months: z.array(revenueMonthSchema),
  topBusinesses: z.array(
    z.object({
      id: idSchema,
      name: z.string().min(1),
      transactions: countSchema,
      feesKobo: koboSchema,
    }),
  ),
});
export type PlatformRevenue = z.output<typeof platformRevenueSchema>;

/** platform.md — `PlatformSettings`. */
export const platformSettingsSchema = z.object({
  transactionFeeKobo: koboSchema,
  feeCapKobo: koboSchema,
  feePayer: z.enum(["customer", "business"]),
  withdrawalFeeKobo: koboSchema,
  withdrawalsPerDay: z.number().int().nonnegative(),
  holdAboveKobo: koboSchema,
  dailyWithdrawalLimitKobo: koboSchema,
  newBankHoldHours: z.number().int().nonnegative(),
  staticRequirements: z.object({
    bvn: z.boolean(),
    photo: z.boolean(),
    bank: z.boolean(),
    volume: z.boolean(),
  }),
  updatedAt: isoDateTimeSchema,
});
export type PlatformSettings = z.output<typeof platformSettingsSchema>;

export const updatePlatformSettingsSchema = platformSettingsSchema
  .omit({ updatedAt: true })
  .partial()
  .extend({
    staticRequirements: platformSettingsSchema.shape.staticRequirements.partial().optional(),
  });
export type UpdatePlatformSettingsInput = z.input<typeof updatePlatformSettingsSchema>;

export const platformNotificationSchema = z.object({
  id: z.string(),
  type: z.enum(["registration", "suspension"]),
  title: z.string().min(1),
  body: z.string(),
  href: z.string(),
  at: isoDateTimeSchema,
});
export type PlatformNotification = z.output<typeof platformNotificationSchema>;
