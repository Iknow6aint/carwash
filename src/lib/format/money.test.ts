import { describe, expect, it } from "vitest";

import { formatNaira, formatSignedNaira, koboToNaira, nairaToKobo, parseNairaInput } from "./money";

describe("formatNaira", () => {
  it("shows whole naira with a ₦ prefix and comma thousands", () => {
    expect(formatNaira(1_250_000)).toBe("₦12,500");
    expect(formatNaira(300_000)).toBe("₦3,000");
    expect(formatNaira(100)).toBe("₦1");
    expect(formatNaira(0)).toBe("₦0");
    expect(formatNaira(100_000_000)).toBe("₦1,000,000");
  });

  it("never shows kobo, NGN or abbreviations", () => {
    const text = formatNaira(1_250_050);
    expect(text).toBe("₦12,501");
    expect(text).not.toMatch(/NGN|\.|k$/);
  });

  it("uses a typographic minus for negative amounts", () => {
    expect(formatNaira(-50_000)).toBe("−₦500");
  });

  it("shows an em dash for missing values", () => {
    expect(formatNaira(null)).toBe("—");
    expect(formatNaira(undefined)).toBe("—");
    expect(formatNaira(Number.NaN)).toBe("—");
  });
});

describe("formatSignedNaira", () => {
  it("signs differences", () => {
    expect(formatSignedNaira(-50_000)).toBe("−₦500");
    expect(formatSignedNaira(100_000)).toBe("+₦1,000");
  });
});

describe("naira ↔ kobo", () => {
  it("converts whole naira to integer kobo (× 100)", () => {
    expect(nairaToKobo(2500)).toBe(250_000);
    expect(nairaToKobo(2500.4)).toBe(250_000);
    expect(koboToNaira(250_000)).toBe(2500);
  });
});

describe("parseNairaInput", () => {
  it.each([
    ["12500", 12500],
    ["12,500", 12500],
    ["₦ 12,500", 12500],
    ["2500.00", 2500],
    [" 3000 ", 3000],
  ])("reads %j as %d", (input, expected) => {
    expect(parseNairaInput(input)).toBe(expected);
  });

  it.each(["", "abc", "12.50", "-500", "1e5"])("rejects %j", (input) => {
    expect(parseNairaInput(input)).toBeNull();
  });
});
