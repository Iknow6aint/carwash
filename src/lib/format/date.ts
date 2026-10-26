import { EM_DASH } from "./text";

/**
 * Dates and times always show in Lagos time (WAT, UTC+1), whatever the device says, because the
 * business day, references and report buckets are all Lagos days (PROJECT_GUIDE §2, §10).
 */
export const BUSINESS_TIME_ZONE = "Africa/Lagos";

export type DateInput = string | number | Date | null | undefined;

const BUSINESS_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses an ISO timestamp, epoch ms, Date, or a `YYYY-MM-DD` business date (read at Lagos noon). */
function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date =
    typeof value === "string" && BUSINESS_DATE.test(value)
      ? new Date(`${value}T12:00:00+01:00`)
      : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, { ...options, timeZone: BUSINESS_TIME_ZONE });
    formatters.set(key, cached);
  }
  return cached;
}

function parts(date: Date, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of formatter("en-GB", options).formatToParts(date)) {
    result[part.type] = part.value;
  }
  return result;
}

/** "2026-10-19": the Lagos calendar date of an instant (the API's `BusinessDate`). */
export function lagosDateKey(value: DateInput = new Date()): string {
  const date = toDate(value);
  if (!date) return "";
  const { year, month, day } = parts(date, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${year}-${month}-${day}`;
}

/** "10:30 AM" (12-hour, uppercase meridiem). */
export function formatTime(value: DateInput): string {
  const date = toDate(value);
  if (!date) return EM_DASH;
  const { hour, minute, dayPeriod } = parts(date, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${hour}:${minute} ${(dayPeriod ?? "").toUpperCase()}`;
}

/** "19 Oct". */
export function formatShortDate(value: DateInput): string {
  const date = toDate(value);
  if (!date) return EM_DASH;
  const { day, month } = parts(date, { day: "numeric", month: "short" });
  return `${day} ${month}`;
}

/** "Sunday, 19 October 2026" (page headers). */
export function formatLongDate(value: DateInput): string {
  const date = toDate(value);
  if (!date) return EM_DASH;
  const { weekday, day, month, year } = parts(date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${weekday}, ${day} ${month} ${year}`;
}

/** "19 Oct 2026, 10:30 AM" (receipts). */
export function formatReceiptDateTime(value: DateInput): string {
  const date = toDate(value);
  if (!date) return EM_DASH;
  const { day, month, year } = parts(date, { day: "numeric", month: "short", year: "numeric" });
  return `${day} ${month} ${year}, ${formatTime(date)}`;
}

/** "Mon 19 Oct" (report days). */
export function formatDayLabel(value: DateInput): string {
  const date = toDate(value);
  if (!date) return EM_DASH;
  const { weekday, day, month } = parts(date, { weekday: "short", day: "numeric", month: "short" });
  return `${weekday} ${day} ${month}`;
}

/** "Mon". */
export function formatWeekday(value: DateInput): string {
  const date = toDate(value);
  if (!date) return EM_DASH;
  return parts(date, { weekday: "short" }).weekday ?? EM_DASH;
}

/** Day of the month as a number (19), or null. */
export function dayOfMonth(value: DateInput): number | null {
  const date = toDate(value);
  if (!date) return null;
  return Number(parts(date, { day: "numeric" }).day);
}

/**
 * "Today, 10:30 AM" for today's sales, "19 Oct, 10:30 AM" for older ones (transaction lists).
 *
 * @param today - Today's Lagos date key; pass it in tests.
 */
export function formatWhen(value: DateInput, today: string = lagosDateKey()): string {
  const date = toDate(value);
  if (!date) return EM_DASH;
  const prefix = lagosDateKey(date) === today ? "Today" : formatShortDate(date);
  return `${prefix}, ${formatTime(date)}`;
}

/** The `dateTime` attribute for a `<time>` element. */
export function isoAttribute(value: DateInput): string | undefined {
  if (typeof value === "string" && BUSINESS_DATE.test(value)) return value;
  return toDate(value)?.toISOString();
}
