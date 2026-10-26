import { describe, expect, it } from "vitest";

import { formatPlate, normalizePlate } from "./plate";

describe("plates", () => {
  it("normalises to capitals with single spaces", () => {
    expect(normalizePlate("kja 482 fx")).toBe("KJA 482 FX");
    expect(normalizePlate("  kja   482\tfx ")).toBe("KJA 482 FX");
  });

  it("stores nothing for an empty plate and shows an em dash", () => {
    expect(normalizePlate("")).toBeNull();
    expect(normalizePlate("   ")).toBeNull();
    expect(normalizePlate(null)).toBeNull();
    expect(formatPlate(null)).toBe("—");
    expect(formatPlate("lsr 101 ab")).toBe("LSR 101 AB");
  });
});
