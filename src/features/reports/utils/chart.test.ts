import { describe, expect, it } from "vitest";

import { report } from "@/testing/fixtures";

import type { ReportDay } from "../schemas/report.schema";

import { chartBars, peakText, rangeText } from "./chart";

function day(date: string, totalKobo: number): ReportDay {
  return {
    date,
    count: 1,
    cashKobo: totalKobo,
    transferKobo: 0,
    posKobo: 0,
    totalKobo,
    cancelledCount: 0,
  };
}

describe("chartBars", () => {
  it("scales every segment to the busiest day, stacked cash → transfer → POS", () => {
    const [first, second] = chartBars(report.days);
    expect(second?.cash).toBeCloseTo((4_000_000 / 11_300_000) * 100);
    expect((second?.cash ?? 0) + (second?.transfer ?? 0) + (second?.pos ?? 0)).toBeCloseTo(100);
    expect(first?.title).toBe("Mon 19 Oct: ₦84,500 · 18 cars");
  });

  it("labels weekdays for up to 10 days", () => {
    expect(chartBars(report.days).map((bar) => bar.tick)).toEqual(["Mon", "Tue"]);
  });

  it("labels every 5th date on longer ranges", () => {
    const days = Array.from({ length: 30 }, (_, index) =>
      day(`2026-10-${String(index + 1).padStart(2, "0")}`, 100),
    );
    const labelled = chartBars(days)
      .map((bar) => bar.tick)
      .filter(Boolean);
    expect(labelled).toEqual(["1", "6", "11", "16", "21", "26"]);
  });

  it("draws flat bars when nothing was sold", () => {
    expect(chartBars([day("2026-10-19", 0)])[0]?.cash).toBe(0);
  });
});

describe("report copy", () => {
  it("describes the range and the peak", () => {
    expect(rangeText("2026-10-19", "2026-10-25", 7)).toBe("19 Oct – 25 Oct · 7 days");
    expect(rangeText("2026-10-19", "2026-10-19", 1)).toBe("19 Oct – 19 Oct · 1 day");
    expect(peakText({ date: "2026-10-20", totalKobo: 11_300_000 })).toBe("Tue 20 Oct · ₦113,000");
  });
});
