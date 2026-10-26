import { z } from "zod";

import {
  businessDateSchema,
  countSchema,
  idSchema,
  isoDateTimeSchema,
  koboSchema,
  pageSchema,
} from "@/lib/api/schema-helpers";
import { PAYMENT_METHODS } from "@/lib/format/payment-method";

/** transactions.md */

export const paymentMethodSchema = z.enum(PAYMENT_METHODS);

export const TRANSACTION_STATUSES = ["paid", "cancelled"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

const actorSchema = z.object({ id: idSchema, name: z.string() });

/** `Transaction`. Service name, list price and recorder name are snapshots taken at save time. */
export const transactionSchema = z.object({
  id: idSchema,
  /** "CW-YYMMDD-NNN": Lagos date + daily sequence from 001. */
  reference: z.string().regex(/^CW-\d{6}-\d{3,}$/),
  service: z.object({ id: idSchema, name: z.string() }),
  listPriceKobo: koboSchema,
  amountKobo: koboSchema,
  /** `amountKobo !== listPriceKobo`. */
  isAdjusted: z.boolean(),
  /** Non-null exactly when `isAdjusted`. */
  adjustmentReason: z.string().nullable(),
  method: paymentMethodSchema,
  paymentConfirmed: z.boolean(),
  vehicle: z.object({
    plate: z.string().nullable(),
    makeModel: z.string().nullable(),
  }),
  status: z.enum(TRANSACTION_STATUSES),
  recordedBy: actorSchema,
  cancellation: z
    .object({
      by: actorSchema,
      reason: z.string(),
      at: isoDateTimeSchema,
    })
    .nullable(),
  businessDate: businessDateSchema,
  createdAt: isoDateTimeSchema,
});
export type Transaction = z.output<typeof transactionSchema>;

/** `GET /transactions`: `Page<Transaction>` plus a summary of everything matching. */
export const transactionListSchema = pageSchema(transactionSchema).extend({
  summary: z.object({
    /** All matching transactions. */
    count: countSchema,
    paidCount: countSchema,
    /** Sum of `amountKobo` over matching paid transactions. */
    paidTotalKobo: koboSchema,
  }),
});
export type TransactionList = z.output<typeof transactionListSchema>;

export const TRANSACTION_RANGES = ["today", "7d", "30d", "all"] as const;
export type TransactionRange = (typeof TRANSACTION_RANGES)[number];

/** `adjusted` = `isAdjusted`, any status. */
export const STATUS_FILTERS = ["paid", "adjusted", "cancelled"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** `GET /transactions` query. */
export const listTransactionsQuerySchema = z.object({
  q: z.string().trim().max(60, "Search with 60 characters or fewer.").optional(),
  range: z.enum(TRANSACTION_RANGES).default("today"),
  method: paymentMethodSchema.optional(),
  status: z.enum(STATUS_FILTERS).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(40),
});
export type ListTransactionsQuery = z.input<typeof listTransactionsQuerySchema>;

/** `POST /transactions` body. */
export const createTransactionSchema = z.object({
  serviceId: idSchema,
  method: paymentMethodSchema,
  plate: z.string().max(15, "Plate numbers are 15 characters or fewer.").nullable().optional(),
  makeModel: z.string().max(60, "Make and model is 60 characters or fewer.").nullable().optional(),
  /** Omit to charge the list price. Whole naira, ₦1 – ₦1,000,000. */
  amountKobo: z
    .number()
    .int()
    .min(100, "Enter the amount charged.")
    .max(100_000_000, "Enter an amount up to ₦1,000,000.")
    .multipleOf(100, "Enter the amount charged.")
    .optional(),
  adjustmentReason: z.string().max(140, "Keep the reason to 140 characters.").nullable().optional(),
  paymentConfirmed: z.boolean().optional(),
});
export type CreateTransactionInput = z.input<typeof createTransactionSchema>;

/** The `Idempotency-Key` header: one UUID per New transaction form session. */
export const idempotencyKeySchema = z.string().min(16).max(128);

/** `POST /transactions/:id/cancel` body. */
export const cancelTransactionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "A reason is required. It stays on the record.")
    .max(140, "Keep the reason to 140 characters."),
});
