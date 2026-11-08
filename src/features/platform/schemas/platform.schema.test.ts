import { describe, expect, it } from "vitest";

import {
  activePlatformBusiness,
  pendingPlatformBusiness,
  platformBusinessPage,
  platformOverview,
} from "@/testing/fixtures";

import {
  listBusinessesQuerySchema,
  platformBusinessPageSchema,
  platformBusinessSchema,
  platformOverviewSchema,
  suspendBusinessSchema,
} from "./platform.schema";

describe("platformBusinessSchema", () => {
  it("parses active and pending businesses from the contract", () => {
    expect(platformBusinessSchema.parse(activePlatformBusiness)).toEqual(activePlatformBusiness);
    const pending = platformBusinessSchema.parse(pendingPlatformBusiness);
    expect(pending.approvedAt).toBeNull();
    expect(pending.lastSaleAt).toBeNull();
  });

  it.each([
    ["an unknown status", { status: "closed" }],
    ["fractional revenue", { last30Days: { carsWashed: 1, revenueKobo: 10.5 } }],
    ["a missing owner email", { registeredBy: { id: activePlatformBusiness.id, name: "A" } }],
    ["a negative staff count", { activeStaffCount: -1 }],
  ])("rejects %s", (_, override) => {
    expect(
      platformBusinessSchema.safeParse({ ...activePlatformBusiness, ...override }).success,
    ).toBe(false);
  });
});

describe("page and overview", () => {
  it("parses a page of businesses and the overview", () => {
    expect(platformBusinessPageSchema.parse(platformBusinessPage)).toEqual(platformBusinessPage);
    expect(platformOverviewSchema.parse(platformOverview)).toEqual(platformOverview);
  });

  it("rejects an overview without the status counts", () => {
    expect(
      platformOverviewSchema.safeParse({ ...platformOverview, businesses: { total: 3 } }).success,
    ).toBe(false);
  });
});

describe("request schemas", () => {
  it("defaults paging and trims the search", () => {
    expect(listBusinessesQuerySchema.parse({ q: " lekki ", status: "pending" })).toEqual({
      q: "lekki",
      status: "pending",
      page: 1,
      limit: 40,
    });
    expect(listBusinessesQuerySchema.safeParse({ status: "closed" }).success).toBe(false);
  });

  it("needs a reason to suspend, with the record copy", () => {
    expect(suspendBusinessSchema.safeParse({ reason: "  " }).error?.issues[0]?.message).toBe(
      "Give a reason. It stays on the record.",
    );
    expect(suspendBusinessSchema.parse({ reason: " Unpaid " })).toEqual({ reason: "Unpaid" });
    expect(suspendBusinessSchema.safeParse({ reason: "x".repeat(201) }).success).toBe(false);
  });
});
