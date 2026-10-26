import { describe, expect, it } from "vitest";

import { API_ROUTES, withQuery } from "./endpoints";

describe("API_ROUTES", () => {
  it("builds parameterised routes", () => {
    expect(API_ROUTES.transactions.cancel("abc")).toBe("/transactions/abc/cancel");
    expect(API_ROUTES.staff.resetPassword("u1")).toBe("/staff/u1/reset-password");
    expect(API_ROUTES.services.detail("a/b")).toBe("/services/a%2Fb");
  });

  it("drops empty query values", () => {
    expect(
      withQuery(API_ROUTES.transactions.list, { range: "7d", q: "", method: undefined, page: 2 }),
    ).toBe("/transactions?range=7d&page=2");
    expect(withQuery(API_ROUTES.dashboard.summary, {})).toBe("/dashboard");
  });
});
