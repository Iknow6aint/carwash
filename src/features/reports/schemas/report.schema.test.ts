import { describe, expect, it } from "vitest";

import { report } from "@/testing/fixtures";

import { reportSchema } from "./report.schema";

describe("reportSchema", () => {
  it("parses the contract's Report", () => {
    const parsed = reportSchema.parse(report);
    expect(parsed.days).toHaveLength(2);
    expect(parsed.peakDay?.date).toBe("2026-10-20");
  });

  it("allows no peak day and a net surcharge (negative adjustment total)", () => {
    const parsed = reportSchema.parse({
      ...report,
      peakDay: null,
      kpis: { ...report.kpis, adjustmentTotalKobo: -50_000 },
    });
    expect(parsed.peakDay).toBeNull();
    expect(parsed.kpis.adjustmentTotalKobo).toBe(-50_000);
  });

  it.each([
    ["an unknown range", { range: "year" }],
    ["a day without a POS total", { days: [{ ...report.days[0], posKobo: undefined }] }],
    ["missing KPIs", { kpis: undefined }],
  ])("rejects %s", (_, override) => {
    expect(reportSchema.safeParse({ ...report, ...override }).success).toBe(false);
  });
});
