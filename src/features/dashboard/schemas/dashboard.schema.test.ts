import { describe, expect, it } from "vitest";

import { dashboard } from "@/testing/fixtures";

import { dashboardSchema } from "./dashboard.schema";

describe("dashboardSchema", () => {
  it("parses the contract's Dashboard", () => {
    const parsed = dashboardSchema.parse(dashboard);
    expect(parsed.methods.map((entry) => entry.method)).toEqual(["cash", "transfer", "pos"]);
    expect(parsed.recent).toHaveLength(3);
  });

  it("rejects methods that are not exactly cash, transfer, pos in order", () => {
    const [cash, transfer, pos] = dashboard.methods;
    expect(
      dashboardSchema.safeParse({ ...dashboard, methods: [transfer, cash, pos] }).success,
    ).toBe(false);
    expect(dashboardSchema.safeParse({ ...dashboard, methods: [cash, transfer] }).success).toBe(
      false,
    );
  });

  it("rejects an unknown period or a share above 1", () => {
    expect(dashboardSchema.safeParse({ ...dashboard, period: "year" }).success).toBe(false);
    const [cash, transfer, pos] = dashboard.methods;
    expect(
      dashboardSchema.safeParse({ ...dashboard, methods: [{ ...cash, share: 48 }, transfer, pos] })
        .success,
    ).toBe(false);
  });
});
