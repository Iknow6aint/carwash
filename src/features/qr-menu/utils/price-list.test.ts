import { describe, expect, it } from "vitest";

import { parsePriceListCsv, parsePriceToKobo, priceListNameKey, splitCsvLine } from "./price-list";

describe("parsePriceListCsv", () => {
  it("reads the header and converts whole naira to kobo", () => {
    const result = parsePriceListCsv('service,price\nFull wash,6000\nTyre shine,"₦1,500"\n');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows).toEqual([
      { line: 2, name: "Full wash", priceKobo: 600_000 },
      { line: 3, name: "Tyre shine", priceKobo: 150_000 },
    ]);
  });

  it("marks missing names, bad prices and duplicates instead of dropping them", () => {
    const result = parsePriceListCsv("Full wash,6000\n,500\nEngine wash,abc\nfull  wash,7000\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows.map((row) => row.error)).toEqual([
      undefined,
      "Give the service a name.",
      "Enter a price in naira.",
      "Duplicate in this file.",
    ]);
  });

  it("rejects an empty file and one over the row cap", () => {
    expect(parsePriceListCsv("  \n")).toEqual({ ok: false, error: "That file has no rows." });
    const tooMany = Array.from({ length: 501 }, (_, index) => `Service ${index},1000`).join("\n");
    expect(parsePriceListCsv(tooMany)).toMatchObject({ ok: false });
  });

  it("keeps commas inside quoted names", () => {
    const result = parsePriceListCsv('"Wash, wax and shine",5000\n');
    expect(result.ok && result.rows[0]).toMatchObject({
      name: "Wash, wax and shine",
      priceKobo: 500_000,
    });
  });
});

describe("parsePriceToKobo", () => {
  it("ignores currency symbols, spaces and commas", () => {
    expect(parsePriceToKobo(" ₦ 6,000 ")).toBe(600_000);
    expect(parsePriceToKobo("0")).toBeNull();
    expect(parsePriceToKobo("")).toBeNull();
  });
});

describe("splitCsvLine", () => {
  it("handles quoted cells and escaped quotes", () => {
    expect(splitCsvLine('a,"b,c","say ""hi"""')).toEqual(["a", "b,c", 'say "hi"']);
  });
});

describe("priceListNameKey", () => {
  it("treats case and spacing as the same name", () => {
    expect(priceListNameKey("  FULL   Wash ")).toBe("full wash");
  });
});
