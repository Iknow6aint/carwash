import { describe, expect, it } from "vitest";

import { fullWash } from "@/testing/fixtures";

import { draftFromService, validateServiceDraft } from "./service-form";

describe("validateServiceDraft", () => {
  it("takes whole naira and sends kobo (× 100)", () => {
    expect(validateServiceDraft({ name: "  Tyre   shine ", price: "2,000" })).toEqual({
      ok: true,
      value: { name: "Tyre shine", priceKobo: 200_000 },
    });
  });

  it("uses the prototype's messages", () => {
    expect(validateServiceDraft({ name: "", price: "" })).toEqual({
      ok: false,
      errors: { name: "Give the service a name.", price: "Enter a price in naira." },
    });
    expect(validateServiceDraft({ name: "Wax", price: "12.50" })).toMatchObject({
      ok: false,
      errors: { price: "Enter a price in naira." },
    });
    expect(validateServiceDraft({ name: "Wax", price: "2000000" })).toMatchObject({
      ok: false,
      errors: { price: "Enter a price up to ₦1,000,000." },
    });
  });

  it("prefills an edit from the service", () => {
    expect(draftFromService(fullWash)).toEqual({ name: "Full wash", price: "6000" });
  });
});
