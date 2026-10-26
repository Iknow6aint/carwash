import { describe, expect, it } from "vitest";

import {
  dayOfMonth,
  formatDayLabel,
  formatLongDate,
  formatReceiptDateTime,
  formatShortDate,
  formatTime,
  formatWeekday,
  formatWhen,
  isoAttribute,
  lagosDateKey,
} from "./date";

describe("Lagos time", () => {
  it("formats 12-hour time with an uppercase meridiem", () => {
    expect(formatTime("2026-10-19T09:30:00.000Z")).toBe("10:30 AM");
    expect(formatTime("2026-10-19T13:05:00.000Z")).toBe("2:05 PM");
  });

  it("puts 23:30 UTC on the next Lagos day (UTC+1)", () => {
    const lateEvening = "2026-10-18T23:30:00.000Z";
    expect(lagosDateKey(lateEvening)).toBe("2026-10-19");
    expect(formatTime(lateEvening)).toBe("12:30 AM");
    expect(formatShortDate(lateEvening)).toBe("19 Oct");
  });

  it("keeps 22:59 UTC on the same Lagos day", () => {
    const beforeMidnight = "2026-10-18T22:59:00.000Z";
    expect(lagosDateKey(beforeMidnight)).toBe("2026-10-18");
    expect(formatTime(beforeMidnight)).toBe("11:59 PM");
  });

  it("formats the page header's long date", () => {
    expect(formatLongDate("2026-10-19T09:30:00.000Z")).toBe("Monday, 19 October 2026");
    expect(formatLongDate("2026-10-20")).toBe("Tuesday, 20 October 2026");
  });

  it("formats receipts and report days", () => {
    expect(formatReceiptDateTime("2026-10-19T09:30:00.000Z")).toBe("19 Oct 2026, 10:30 AM");
    expect(formatDayLabel("2026-10-20")).toBe("Tue 20 Oct");
    expect(formatWeekday("2026-10-19")).toBe("Mon");
    expect(dayOfMonth("2026-10-19")).toBe(19);
  });

  it("never shifts a business date by a day", () => {
    expect(formatShortDate("2026-10-01")).toBe("1 Oct");
    expect(formatShortDate("2026-10-31")).toBe("31 Oct");
    expect(isoAttribute("2026-10-31")).toBe("2026-10-31");
  });

  it("says Today for today's sales and the date otherwise", () => {
    expect(formatWhen("2026-10-19T09:30:00.000Z", "2026-10-19")).toBe("Today, 10:30 AM");
    expect(formatWhen("2026-10-18T09:30:00.000Z", "2026-10-19")).toBe("18 Oct, 10:30 AM");
    expect(formatWhen("2026-10-18T23:30:00.000Z", "2026-10-19")).toBe("Today, 12:30 AM");
  });

  it("shows an em dash for missing or invalid dates", () => {
    expect(formatTime(null)).toBe("—");
    expect(formatShortDate("not a date")).toBe("—");
  });
});
