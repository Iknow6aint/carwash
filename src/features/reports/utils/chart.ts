import { dayOfMonth, formatDayLabel, formatShortDate, formatWeekday } from "@/lib/format/date";
import { formatNaira } from "@/lib/format/money";
import { plural } from "@/lib/format/text";

import type { ReportDay } from "../schemas/report.schema";

/** Up to this many days, ticks name the weekday; longer ranges label every 5th date. */
export const WEEKDAY_TICK_LIMIT = 10;

export interface ChartBar {
  date: string;
  /** Segment heights as a share of the tallest day (0–100), stacked cash → transfer → POS. */
  cash: number;
  transfer: number;
  pos: number;
  /** Native tooltip: "Mon 19 Oct: ₦98,750 · 21 cars". */
  title: string;
  /** Axis label; empty when this day is not labelled. */
  tick: string;
}

/**
 * The hand-built stacked bar chart's geometry (prototype "Revenue by day"). Every bar is scaled to
 * the busiest day; ticks are weekdays for short ranges, else the 1st, 6th, 11th... of the month.
 */
export function chartBars(days: readonly ReportDay[]): ChartBar[] {
  const max = Math.max(1, ...days.map((day) => day.totalKobo));
  const percent = (kobo: number) => (kobo / max) * 100;
  return days.map((day) => {
    const date = dayOfMonth(day.date) ?? 0;
    return {
      date: day.date,
      cash: percent(day.cashKobo),
      transfer: percent(day.transferKobo),
      pos: percent(day.posKobo),
      title: `${formatDayLabel(day.date)}: ${formatNaira(day.totalKobo)} · ${plural(day.count, "car")}`,
      tick:
        days.length <= WEEKDAY_TICK_LIMIT
          ? formatWeekday(day.date)
          : date % 5 === 1
            ? String(date)
            : "",
    };
  });
}

/** "13 Oct – 19 Oct · 7 days". */
export function rangeText(from: string, to: string, dayCount: number): string {
  return `${formatShortDate(from)} – ${formatShortDate(to)} · ${plural(dayCount, "day")}`;
}

/** "Tue 20 Oct · ₦113,000". */
export function peakText(peak: { date: string; totalKobo: number }): string {
  return `${formatDayLabel(peak.date)} · ${formatNaira(peak.totalKobo)}`;
}
