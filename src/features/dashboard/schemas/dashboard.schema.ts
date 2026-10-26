import { z } from "zod";

import {
  paymentMethodSchema,
  transactionSchema,
} from "@/features/transactions/schemas/transaction.schema";
import { businessDateSchema, countSchema, idSchema, koboSchema } from "@/lib/api/schema-helpers";
import { PAYMENT_METHODS } from "@/lib/format/payment-method";

/** reports.md — `Dashboard`. Paid transactions only, unless a field says otherwise. */

export const DASHBOARD_PERIODS = ["today", "week", "month"] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

const methodTotalSchema = z.object({
  method: paymentMethodSchema,
  count: countSchema,
  totalKobo: koboSchema,
  /** 0–1 of revenue; 0 when revenue is 0. */
  share: z.number().min(0).max(1),
});

export const dashboardSchema = z.object({
  period: z.enum(DASHBOARD_PERIODS),
  from: businessDateSchema,
  to: businessDateSchema,
  revenueKobo: koboSchema,
  carsWashed: countSchema,
  /** revenue / cars, rounded; 0 when no cars. */
  averageKobo: koboSchema,
  /** Cancelled in the period (excluded from everything else). */
  cancelledCount: countSchema,
  /** Always exactly 3, in this order: cash, transfer, pos. */
  methods: z
    .array(methodTotalSchema)
    .length(3)
    .refine(
      (methods) => methods.every((entry, index) => entry.method === PAYMENT_METHODS[index]),
      "Methods come as cash, transfer, pos.",
    ),
  /** count desc, then revenue desc. */
  topServices: z.array(
    z.object({
      serviceId: idSchema,
      name: z.string(),
      count: countSchema,
      revenueKobo: koboSchema,
    }),
  ),
  /** count desc. */
  staff: z.array(
    z.object({ userId: idSchema, name: z.string(), count: countSchema, revenueKobo: koboSchema }),
  ),
  /** Newest 7 transactions of any status, regardless of period. */
  recent: z.array(transactionSchema),
});
export type Dashboard = z.output<typeof dashboardSchema>;
