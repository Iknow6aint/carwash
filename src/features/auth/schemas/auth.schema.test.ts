import { describe, expect, it } from "vitest";

import { adminUser, authSession, cashierUser } from "@/testing/fixtures";

import {
  authSessionSchema,
  changePasswordInputSchema,
  loginInputSchema,
  userSchema,
} from "./auth.schema";

describe("userSchema", () => {
  it("parses admins and cashiers from the contract", () => {
    expect(userSchema.parse(adminUser)).toEqual(adminUser);
    expect(userSchema.parse(cashierUser).role).toBe("cashier");
    expect(userSchema.parse({ ...adminUser, lastLoginAt: null }).lastLoginAt).toBeNull();
  });

  it.each([
    ["an unknown role", { role: "owner" }],
    ["a missing mustChangePassword", { mustChangePassword: undefined }],
    ["a string isActive", { isActive: "true" }],
  ])("rejects %s", (_, override) => {
    expect(userSchema.safeParse({ ...adminUser, ...override }).success).toBe(false);
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
