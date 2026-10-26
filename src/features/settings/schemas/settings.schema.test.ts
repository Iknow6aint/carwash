import { describe, expect, it } from "vitest";

import { businessSettings } from "@/testing/fixtures";

import { businessSettingsSchema, updateBusinessSettingsSchema } from "./settings.schema";

describe("businessSettingsSchema", () => {
  it("parses BusinessSettings and only accepts NGN", () => {
    expect(businessSettingsSchema.parse(businessSettings)).toEqual(businessSettings);
    expect(businessSettingsSchema.safeParse({ ...businessSettings, currency: "USD" }).success).toBe(
      false,
    );
    expect(
      businessSettingsSchema.safeParse({
        ...businessSettings,
        requirePaymentConfirmation: undefined,
      }).success,
    ).toBe(false);
  });

  it("checks the contract's lengths on a save", () => {
    expect(updateBusinessSettingsSchema.safeParse({ name: "" }).success).toBe(false);
    expect(updateBusinessSettingsSchema.safeParse({ receiptFooter: "x".repeat(121) }).success).toBe(
      false,
    );
    expect(updateBusinessSettingsSchema.parse({ phone: " 0803 412 7790 " })).toEqual({
      phone: "0803 412 7790",
    });
  });
});
