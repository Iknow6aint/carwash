import { describe, expect, it } from "vitest";

import { API_ROUTES, withQuery } from "./endpoints";

describe("API_ROUTES", () => {
  it("builds parameterised routes", () => {
    expect(API_ROUTES.transactions.cancel("abc")).toBe("/transactions/abc/cancel");
    expect(API_ROUTES.staff.resetPassword("u1")).toBe("/staff/u1/reset-password");
    expect(API_ROUTES.services.detail("a/b")).toBe("/services/a%2Fb");
    expect(API_ROUTES.platform.businesses.approve("b1")).toBe("/platform/businesses/b1/approve");
    expect(API_ROUTES.platform.businesses.suspend("b1")).toBe("/platform/businesses/b1/suspend");
    expect(API_ROUTES.platform.businesses.reactivate("b/1")).toBe(
      "/platform/businesses/b%2F1/reactivate",
    );
  });

  it("drops empty query values", () => {
    expect(
      withQuery(API_ROUTES.transactions.list, { range: "7d", q: "", method: undefined, page: 2 }),
    ).toBe("/transactions?range=7d&page=2");
    expect(withQuery(API_ROUTES.dashboard.summary, {})).toBe("/dashboard");
  });
});
