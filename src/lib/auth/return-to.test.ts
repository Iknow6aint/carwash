import { describe, expect, it } from "vitest";

import {
  deskRedirect,
  homePathForRole,
  isInRoleArea,
  landingPath,
  loginPath,
  platformRedirect,
  returnToFromUrl,
  safeReturnTo,
  type LandingUser,
} from "./return-to";

const active = { status: "active" } as const;
const admin: LandingUser = { role: "admin", mustChangePassword: false, business: active };
const cashier: LandingUser = { role: "cashier", mustChangePassword: false, business: active };
const superAdmin: LandingUser = { role: "super_admin", mustChangePassword: false, business: null };
const pendingOwner: LandingUser = { ...admin, business: { status: "pending" } };
const suspendedCashier: LandingUser = { ...cashier, business: { status: "suspended" } };

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
    expect(safeReturnTo("/register")).toBeNull();
    expect(safeReturnTo("/business-status")).toBeNull();
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
  it("lands super admins on the platform, admins on the dashboard, cashiers on New transaction", () => {
    expect(homePathForRole("super_admin")).toBe("/platform");
    expect(homePathForRole("admin")).toBe("/dashboard");
    expect(landingPath(superAdmin)).toBe("/platform");
    expect(landingPath(admin)).toBe("/dashboard");
    expect(landingPath(cashier)).toBe("/new");
  });

  it("honours a safe returnTo, and a temporary password always comes first", () => {
    expect(landingPath(cashier, "/transactions")).toBe("/transactions");
    expect(landingPath(cashier, "https://evil.example")).toBe("/new");
    expect(landingPath({ ...admin, mustChangePassword: true }, "/transactions")).toBe(
      "/change-password",
    );
    expect(landingPath({ ...pendingOwner, mustChangePassword: true })).toBe("/change-password");
  });

  it("sends staff of a pending or suspended business to the status page, whatever returnTo says", () => {
    expect(landingPath(pendingOwner)).toBe("/business-status");
    expect(landingPath(pendingOwner, "/dashboard")).toBe("/business-status");
    expect(landingPath(suspendedCashier, "/new")).toBe("/business-status");
    expect(landingPath({ ...cashier, business: null })).toBe("/business-status");
  });

  it("only returns someone to a page in their own area", () => {
    expect(landingPath(superAdmin, "/platform/businesses/abc")).toBe("/platform/businesses/abc");
    expect(landingPath(superAdmin, "/dashboard")).toBe("/platform");
    expect(landingPath(admin, "/platform")).toBe("/dashboard");
    expect(landingPath(admin, "/platform/businesses/abc?x=1")).toBe("/dashboard");
    expect(isInRoleArea("admin", "/platforms")).toBe(true);
    expect(isInRoleArea("super_admin", "/platform?status=pending")).toBe(true);
  });
});

describe("deskRedirect", () => {
  it("lets staff of an active business in", () => {
    expect(deskRedirect(admin)).toBeNull();
    expect(deskRedirect(cashier)).toBeNull();
  });

  it("sends everyone else where they belong, never back to the desk", () => {
    expect(deskRedirect(superAdmin)).toBe("/platform");
    expect(deskRedirect({ ...superAdmin, mustChangePassword: true })).toBe("/change-password");
    expect(deskRedirect({ ...cashier, mustChangePassword: true })).toBe("/change-password");
    expect(deskRedirect(pendingOwner)).toBe("/business-status");
    expect(deskRedirect(suspendedCashier)).toBe("/business-status");
  });
});

describe("platformRedirect", () => {
  it("lets super admins in", () => {
    expect(platformRedirect(superAdmin)).toBeNull();
  });

  it("sends staff to their own landing, never to the platform", () => {
    expect(platformRedirect(admin)).toBe("/dashboard");
    expect(platformRedirect(cashier)).toBe("/new");
    expect(platformRedirect(pendingOwner)).toBe("/business-status");
    expect(platformRedirect({ ...superAdmin, mustChangePassword: true })).toBe("/change-password");
  });
});
