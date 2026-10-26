import {
  formatDayLabel,
  formatLongDate,
  formatReceiptDateTime,
  formatShortDate,
  formatTime,
  formatWhen,
  isoAttribute,
  type DateInput,
} from "@/lib/format/date";

const FORMATS = {
  /** "10:30 AM" */
  time: formatTime,
  /** "19 Oct" */
  short: formatShortDate,
  /** "Monday, 19 October 2026" */
  long: formatLongDate,
  /** "Mon 19 Oct" */
  day: formatDayLabel,
  /** "19 Oct 2026, 10:30 AM" */
  receipt: formatReceiptDateTime,
  /** "Today, 10:30 AM" / "19 Oct, 10:30 AM" */
  when: (value: DateInput) => formatWhen(value),
} as const;

/** A date or time in Lagos time, as a `<time>` element. */
export function DateText({
  value,
  format,
  className,
}: {
  value: DateInput;
  format: keyof typeof FORMATS;
  className?: string;
}) {
  return (
    <time className={className} dateTime={isoAttribute(value)}>
      {FORMATS[format](value)}
    </time>
  );
}
