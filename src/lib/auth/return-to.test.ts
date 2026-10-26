import { describe, expect, it } from "vitest";

import {
  homePathForRole,
  landingPath,
  loginPath,
  returnToFromUrl,
  safeReturnTo,
} from "./return-to";

describe("safeReturnTo", () => {
  it("keeps local pages with their query", () => {
    expect(safeReturnTo("/transactions")).toBe("/transactions");
    expect(safeReturnTo("/transactions?range=7d&method=cash")).toBe(
      "/transactions?range=7d&method=cash",
    );
  });

  it.each([
    null,
    undefined,
    "",
    "transactions",
    "https://evil.example/",
    "//evil.example",
    "/\\evil.example",
    "/settings\\..\\x",
    "javascript:alert(1)",
    "/dashboard\n",
    "/",
  ])("rejects %j", (value) => {
    expect(safeReturnTo(value)).toBeNull();
  });

  it("never returns to pages that would loop, or to file routes", () => {
    expect(safeReturnTo("/login")).toBeNull();
    expect(safeReturnTo("/login?returnTo=%2Flogin")).toBeNull();
    expect(safeReturnTo("/change-password")).toBeNull();
    expect(safeReturnTo("/api/export/transactions?range=7d")).toBeNull();
    expect(safeReturnTo("/loginsights")).toBe("/loginsights");
  });
});

describe("loginPath", () => {
  it("encodes the page so it survives the redirect", () => {
    expect(loginPath("/transactions?range=7d")).toBe(
      "/login?returnTo=%2Ftransactions%3Frange%3D7d",
    );
    expect(loginPath(null)).toBe("/login");
    expect(loginPath("//evil.example")).toBe("/login");
  });
});

describe("returnToFromUrl", () => {
  it("keeps path and query but drops framework parameters", () => {
    expect(returnToFromUrl(new URL("https://desk.example/transactions?range=7d&_rsc=1x9z"))).toBe(
      "/transactions?range=7d",
    );
  });
});

describe("landingPath", () => {
  it("lands admins on the dashboard and cashiers on New transaction", () => {
    expect(homePathForRole("admin")).toBe("/dashboard");
    expect(landingPath({ role: "admin", mustChangePassword: false })).toBe("/dashboard");
    expect(landingPath({ role: "cashier", mustChangePassword: false })).toBe("/new");
  });

  it("honours a safe returnTo, and a temporary password always comes first", () => {
    expect(landingPath({ role: "cashier", mustChangePassword: false }, "/transactions")).toBe(
      "/transactions",
    );
    expect(
      landingPath({ role: "cashier", mustChangePassword: false }, "https://evil.example"),
    ).toBe("/new");
    expect(landingPath({ role: "admin", mustChangePassword: true }, "/transactions")).toBe(
      "/change-password",
    );
  });
});
