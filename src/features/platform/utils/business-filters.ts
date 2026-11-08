import { businessStatusSchema, type BusinessStatus } from "@/lib/api/schema-helpers";

import { BUSINESS_SEARCH_MAX_LENGTH, type ListBusinessesQuery } from "../schemas/platform.schema";

/**
 * The Businesses screen's filters. They live in the URL (`?status=pending&q=lekki`) so a refresh
 * or a shared link keeps them: read on load, written on every change. Defaults are left out of
 * the URL.
 */
export interface BusinessFilters {
  q: string;
  status: BusinessStatus | "all";
}

export const DEFAULT_BUSINESS_FILTERS: BusinessFilters = { q: "", status: "all" };

const STATUSES = businessStatusSchema.options;

type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function read(params: SearchParamsInput, key: string): string {
  if (params instanceof URLSearchParams) return params.get(key)?.trim() ?? "";
  const value = params[key];
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

/** Reads filters from a URL; unknown values fall back to the defaults. */
export function parseBusinessFilters(params: SearchParamsInput): BusinessFilters {
  const status = read(params, "status");
  return {
    q: read(params, "q").slice(0, BUSINESS_SEARCH_MAX_LENGTH),
    status: (STATUSES as readonly string[]).includes(status) ? (status as BusinessStatus) : "all",
  };
}

/** Filters as URL search params, without defaults (the inverse of {@link parseBusinessFilters}). */
export function businessFiltersToSearchParams(filters: BusinessFilters): URLSearchParams {
  const params = new URLSearchParams();
  const q = filters.q.trim();
  if (q) params.set("q", q);
  if (filters.status !== "all") params.set("status", filters.status);
  return params;
}

/** The `GET /platform/businesses` query for these filters (paging is added by the hook). */
export function businessFiltersToQuery(
  filters: BusinessFilters,
): Pick<ListBusinessesQuery, "q" | "status"> {
  const q = filters.q.trim();
  return {
    ...(q ? { q } : {}),
    ...(filters.status !== "all" ? { status: filters.status } : {}),
  };
}

/** True when nothing narrows the list. */
export function isUnfiltered(filters: BusinessFilters): boolean {
  return filters.status === "all" && !filters.q.trim();
}
