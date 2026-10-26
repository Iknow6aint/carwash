import { describe, expect, it } from "vitest";

import { exteriorWash, fullWash } from "@/testing/fixtures";

import { createServiceSchema, serviceListSchema, serviceSchema } from "./service.schema";

describe("serviceSchema", () => {
  it("parses the contract's Service list", () => {
    expect(serviceListSchema.parse([exteriorWash, fullWash])).toHaveLength(2);
  });

  it.each([
    ["a zero price", { priceKobo: 0 }],
    ["a float price", { priceKobo: 3000.5 }],
    ["a missing soldLast30Days", { soldLast30Days: undefined }],
  ])("rejects %s", (_, override) => {
    expect(serviceSchema.safeParse({ ...fullWash, ...override }).success).toBe(false);
  });

  it("takes whole naira only when adding a service", () => {
    expect(createServiceSchema.safeParse({ name: "Tyre shine", priceKobo: 200_000 }).success).toBe(
      true,
    );
    expect(createServiceSchema.safeParse({ name: "Tyre shine", priceKobo: 200_050 }).success).toBe(
      false,
    );
    expect(
      createServiceSchema.safeParse({ name: "  ", priceKobo: 200_000 }).error?.issues[0]?.message,
    ).toBe("Give the service a name.");
  });
});
