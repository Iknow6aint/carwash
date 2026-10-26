import { describe, expect, it } from "vitest";

import {
  DEFAULT_TRANSACTION_FILTERS,
  isUnfiltered,
  parseTransactionFilters,
  transactionFiltersToQuery,
  transactionFiltersToSearchParams,
  type TransactionFilters,
} from "./transaction-filters";

describe("transaction filters ↔ URL", () => {
  it.each<TransactionFilters>([
    DEFAULT_TRANSACTION_FILTERS,
    { q: "KJA 482", range: "7d", method: "cash", status: "paid" },
    { q: "", range: "all", method: "pos", status: "cancelled" },
    { q: "CW-261019", range: "30d", method: "transfer", status: "adjusted" },
    { q: "tunde", range: "today", method: "all", status: "all" },
  ])("round-trips %j through the query string", (filters) => {
    const search = transactionFiltersToSearchParams(filters).toString();
    expect(parseTransactionFilters(new URLSearchParams(search))).toEqual(filters);
  });

  it("leaves defaults out of the URL", () => {
    expect(transactionFiltersToSearchParams(DEFAULT_TRANSACTION_FILTERS).toString()).toBe("");
    expect(
      transactionFiltersToSearchParams({
        ...DEFAULT_TRANSACTION_FILTERS,
        range: "7d",
        method: "cash",
      }).toString(),
    ).toBe("range=7d&method=cash");
  });

  it("reads Next's searchParams object, first value wins", () => {
    expect(
      parseTransactionFilters({ range: ["30d", "7d"], q: "  kja ", method: undefined }),
    ).toEqual({
      q: "kja",
      range: "30d",
      method: "all",
      status: "all",
    });
  });

  it("ignores unknown values and caps the search at 60 characters", () => {
    const parsed = parseTransactionFilters(
      new URLSearchParams({ range: "year", method: "card", status: "deleted", q: "x".repeat(80) }),
    );
    expect(parsed).toEqual({ q: "x".repeat(60), range: "today", method: "all", status: "all" });
  });

  it("builds the API query without the 'all' choices", () => {
    expect(
      transactionFiltersToQuery({ q: " kja ", range: "7d", method: "all", status: "adjusted" }),
    ).toEqual({
      q: "kja",
      range: "7d",
      status: "adjusted",
    });
  });

  it("knows when nothing narrows the list", () => {
    expect(isUnfiltered({ ...DEFAULT_TRANSACTION_FILTERS, range: "all" })).toBe(true);
    expect(isUnfiltered(DEFAULT_TRANSACTION_FILTERS)).toBe(false);
  });
});
