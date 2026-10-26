import { z } from "zod";

import {
  businessDateSchema,
  countSchema,
  idSchema,
  koboSchema,
  signedKoboSchema,
} from "@/lib/api/schema-helpers";

/** reports.md — `Report`. Paid transactions only, unless a field says otherwise. */

export const REPORT_RANGES = ["week", "month", "30d"] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export const reportDaySchema = z.object({
  date: businessDateSchema,
  count: countSchema,
  cashKobo: koboSchema,
  transferKobo: koboSchema,
  posKobo: koboSchema,
  totalKobo: koboSchema,
  cancelledCount: countSchema,
});
export type ReportDay = z.output<typeof reportDaySchema>;

export const reportSchema = z.object({
  range: z.enum(REPORT_RANGES),
  from: businessDateSchema,
  to: businessDateSchema,
  dayCount: z.number().int().min(1),
  kpis: z.object({
    revenueKobo: koboSchema,
    carsWashed: countSchema,
    /** Rounded to the nearest whole car. */
    averageCarsPerDay: countSchema,
    /** revenue / dayCount, rounded. */
    dailyAverageKobo: koboSchema,
    /** Paid and adjusted. */
    adjustedCount: countSchema,
    /** Σ(listPrice − amount) over paid adjusted; positive = discounts given. */
    adjustmentTotalKobo: signedKoboSchema,
    cancelledCount: countSchema,
  }),
  /** Every day from..to ascending, zero-filled. */
  days: z.array(reportDaySchema),
  /** null when there is no revenue. */
  peakDay: z
    .object({ date: businessDateSchema, totalKobo: koboSchema, count: countSchema })
    .nullable(),
  /** Revenue desc. */
  services: z.array(
    z.object({
      serviceId: idSchema,
      name: z.string(),
      count: countSchema,
      revenueKobo: koboSchema,
      share: z.number().min(0).max(1),
    }),
  ),
  /** Revenue desc. */
  staff: z.array(
    z.object({
      userId: idSchema,
      name: z.string(),
      count: countSchema,
      adjustedCount: countSchema,
      revenueKobo: koboSchema,
    }),
  ),
});
export type Report = z.output<typeof reportSchema>;
