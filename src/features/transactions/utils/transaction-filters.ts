import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/format/payment-method";

import {
  STATUS_FILTERS,
  TRANSACTION_RANGES,
  type ListTransactionsQuery,
  type StatusFilter,
  type TransactionRange,
} from "../schemas/transaction.schema";

/**
 * The Transactions screen's filters. They live in the URL (`?range=7d&method=cash&q=kja`) so a
 * refresh or a shared link keeps them: read on load, written on every change. Defaults are left
 * out of the URL.
 */
export interface TransactionFilters {
  q: string;
  range: TransactionRange;
  method: PaymentMethod | "all";
  status: StatusFilter | "all";
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  q: "",
  range: "today",
  method: "all",
  status: "all",
};

export const SEARCH_MAX_LENGTH = 60;

type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function read(params: SearchParamsInput, key: string): string {
  if (params instanceof URLSearchParams) return params.get(key)?.trim() ?? "";
  const value = params[key];
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Reads filters from a URL; unknown values fall back to the defaults. */
export function parseTransactionFilters(params: SearchParamsInput): TransactionFilters {
  return {
    q: read(params, "q").slice(0, SEARCH_MAX_LENGTH),
    range: oneOf(read(params, "range"), TRANSACTION_RANGES, DEFAULT_TRANSACTION_FILTERS.range),
    method: oneOf<PaymentMethod | "all">(read(params, "method"), PAYMENT_METHODS, "all"),
    status: oneOf<StatusFilter | "all">(read(params, "status"), STATUS_FILTERS, "all"),
  };
}

/** Filters as URL search params, without defaults (the inverse of {@link parseTransactionFilters}). */
export function transactionFiltersToSearchParams(filters: TransactionFilters): URLSearchParams {
  const params = new URLSearchParams();
  const q = filters.q.trim();
  if (q) params.set("q", q);
  if (filters.range !== DEFAULT_TRANSACTION_FILTERS.range) params.set("range", filters.range);
  if (filters.method !== "all") params.set("method", filters.method);
  if (filters.status !== "all") params.set("status", filters.status);
  return params;
}

/** The `GET /transactions` (and export) query for these filters. */
export function transactionFiltersToQuery(
  filters: TransactionFilters,
): Pick<ListTransactionsQuery, "q" | "range" | "method" | "status"> {
  const q = filters.q.trim();
  return {
    range: filters.range,
    ...(q ? { q } : {}),
    ...(filters.method !== "all" ? { method: filters.method } : {}),
    ...(filters.status !== "all" ? { status: filters.status } : {}),
  };
}

/** True when nothing narrows the list (every range, no search, method or status). */
export function isUnfiltered(filters: TransactionFilters): boolean {
  return (
    filters.range === "all" &&
    !filters.q.trim() &&
    filters.method === "all" &&
    filters.status === "all"
  );
}
