import { describe, expect, it } from "vitest";

import {
  businessFiltersToQuery,
  businessFiltersToSearchParams,
  DEFAULT_BUSINESS_FILTERS,
  isUnfiltered,
  parseBusinessFilters,
  type BusinessFilters,
} from "./business-filters";

describe("business filters ↔ URL", () => {
  it.each<BusinessFilters>([
    DEFAULT_BUSINESS_FILTERS,
    { q: "lekki", status: "pending" },
    { q: "", status: "suspended" },
    { q: "chidi@splash.ng", status: "all" },
  ])("round-trips %j through the query string", (filters) => {
    const search = businessFiltersToSearchParams(filters).toString();
    expect(parseBusinessFilters(new URLSearchParams(search))).toEqual(filters);
  });

  it("leaves defaults out of the URL", () => {
    expect(businessFiltersToSearchParams(DEFAULT_BUSINESS_FILTERS).toString()).toBe("");
    expect(businessFiltersToSearchParams({ q: "  ", status: "active" }).toString()).toBe(
      "status=active",
    );
  });

  it("falls back to the defaults for unknown or oversized values", () => {
    expect(parseBusinessFilters({ status: "closed", q: ["  splash ", "x"] })).toEqual({
      q: "splash",
      status: "all",
    });
    expect(parseBusinessFilters({ q: "x".repeat(80) }).q).toHaveLength(60);
  });
});

describe("businessFiltersToQuery", () => {
  it("sends only what narrows the list", () => {
    expect(businessFiltersToQuery(DEFAULT_BUSINESS_FILTERS)).toEqual({});
    expect(businessFiltersToQuery({ q: " lekki ", status: "pending" })).toEqual({
      q: "lekki",
      status: "pending",
    });
    expect(isUnfiltered(DEFAULT_BUSINESS_FILTERS)).toBe(true);
    expect(isUnfiltered({ q: "", status: "active" })).toBe(false);
  });
});
