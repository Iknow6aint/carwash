import { describe, expect, it } from "vitest";

import {
  adminUser,
  authSession,
  cashierUser,
  pendingOwnerSessionUser,
  superAdminSessionUser,
  superAdminUser,
} from "@/testing/fixtures";

import {
  authSessionSchema,
  changePasswordInputSchema,
  loginInputSchema,
  registerInputSchema,
  sessionUserSchema,
  userSchema,
} from "./auth.schema";

describe("userSchema", () => {
  it("parses admins and cashiers from the contract", () => {
    expect(userSchema.parse(adminUser)).toEqual(adminUser);
    expect(userSchema.parse(cashierUser).role).toBe("cashier");
    expect(userSchema.parse({ ...adminUser, lastLoginAt: null }).lastLoginAt).toBeNull();
  });

  it("parses a super admin, who belongs to no business", () => {
    expect(userSchema.parse(superAdminUser)).toEqual(superAdminUser);
  });

  it.each([
    ["an unknown role", { role: "owner" }],
    ["a missing mustChangePassword", { mustChangePassword: undefined }],
    ["a string isActive", { isActive: "true" }],
    ["a missing businessId", { businessId: undefined }],
  ])("rejects %s", (_, override) => {
    expect(userSchema.safeParse({ ...adminUser, ...override }).success).toBe(false);
  });
});

describe("sessionUserSchema", () => {
  it("carries the business for staff and null for super admins", () => {
    expect(sessionUserSchema.parse(pendingOwnerSessionUser).business?.status).toBe("pending");
    expect(sessionUserSchema.parse(superAdminSessionUser).business).toBeNull();
  });

  it.each([
    ["no business key", { business: undefined }],
    ["an unknown status", { business: { ...pendingOwnerSessionUser.business, status: "closed" } }],
  ])("rejects %s", (_, override) => {
    expect(sessionUserSchema.safeParse({ ...pendingOwnerSessionUser, ...override }).success).toBe(
      false,
    );
  });
});

describe("authSessionSchema", () => {
  it("parses login / refresh / password-change responses", () => {
    expect(authSessionSchema.parse(authSession)).toEqual(authSession);
  });

  it("rejects a session without a refresh token or expiry", () => {
    expect(authSessionSchema.safeParse({ ...authSession, refreshToken: "" }).success).toBe(false);
    expect(
      authSessionSchema.safeParse({ ...authSession, accessTokenExpiresAt: undefined }).success,
    ).toBe(false);
  });
});

describe("form inputs", () => {
  it("lowercases the email and uses the prototype's messages", () => {
    expect(loginInputSchema.parse({ email: " Adaeze@CartoryWash.ng ", password: "x" }).email).toBe(
      "adaeze@cartorywash.ng",
    );
    expect(loginInputSchema.safeParse({ email: "", password: "x" }).error?.issues[0]?.message).toBe(
      "Enter your email.",
    );
    expect(
      loginInputSchema.safeParse({ email: "a@b.co", password: "" }).error?.issues[0]?.message,
    ).toBe("Enter your password.");
  });

  it("needs a new password of 8+ characters that differs from the current one", () => {
    expect(
      changePasswordInputSchema.safeParse({ currentPassword: "temp-1234", newPassword: "short" })
        .success,
    ).toBe(false);
    const same = changePasswordInputSchema.safeParse({
      currentPassword: "temp-1234",
      newPassword: "temp-1234",
    });
    expect(same.error?.issues[0]?.path).toEqual(["newPassword"]);
    expect(
      changePasswordInputSchema.safeParse({
        currentPassword: "temp-1234",
        newPassword: "my-own-pass",
      }).success,
    ).toBe(true);
  });
});

describe("registerInputSchema", () => {
  const valid = {
    businessName: "  Splash Point ",
    businessPhone: " 0812 555 0101 ",
    name: " Chidi Obi ",
    email: " Chidi@Splash.NG ",
    password: "splash-1234",
  };

  it("trims, lowercases the email and leaves the address optional", () => {
    expect(registerInputSchema.parse(valid)).toEqual({
      businessName: "Splash Point",
      businessPhone: "0812 555 0101",
      name: "Chidi Obi",
      email: "chidi@splash.ng",
      password: "splash-1234",
    });
  });

  it.each([
    ["businessName", { businessName: " " }, "Enter your business name."],
    ["businessName", { businessName: "x".repeat(81) }, "Use 80 characters or fewer."],
    ["businessPhone", { businessPhone: "" }, "Enter a phone number."],
    ["businessAddress", { businessAddress: "x".repeat(161) }, "Use 160 characters or fewer."],
    ["name", { name: "" }, "Enter your name."],
    ["email", { email: "chidi" }, "Enter a valid email."],
    ["password", { password: "short" }, "Use at least 8 characters."],
  ])("explains a bad %s", (field, override, message) => {
    const issue = registerInputSchema.safeParse({ ...valid, ...override }).error?.issues[0];
    expect(issue?.path).toEqual([field]);
    expect(issue?.message).toBe(message);
  });
});
