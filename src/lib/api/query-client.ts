import { isServer, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { BUSINESS_STATUS_PATH, loginPath } from "@/lib/auth/return-to";

import { ApiError, type ApiErrorKind } from "./api-error";

/** Errors that will not change on a retry. */
const FINAL_KINDS: readonly ApiErrorKind[] = [
  "unauthorized",
  "forbidden",
  "not-found",
  "validation",
  "conflict",
];

/** The API's answers when the caller's business stops being active mid-session (ADR-002). */
const BUSINESS_LOCKED_CODES: readonly string[] = ["BUSINESS_PENDING", "BUSINESS_SUSPENDED"];

/**
 * Where a failed data call should send the tab, or `null` to show the error in place.
 *
 * - `unauthorized`: the session can no longer be renewed (the proxy already tried), so sign in
 *   again and come back to the same page.
 * - the business was suspended (or sent back to pending) while staff were working: the status page
 *   explains it, instead of an error on every panel.
 */
export function redirectForError(error: unknown, currentPage: string): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.kind === "unauthorized") return loginPath(currentPage);
  if (error.code && BUSINESS_LOCKED_CODES.includes(error.code)) return BUSINESS_STATUS_PATH;
  return null;
}

function redirectOnError(error: unknown) {
  if (typeof window === "undefined") return;
  const target = redirectForError(error, `${window.location.pathname}${window.location.search}`);
  if (target) window.location.assign(target);
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: redirectOnError }),
    mutationCache: new MutationCache({ onError: redirectOnError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 10 * 60_000,
        retry: (failureCount, error) =>
          failureCount < 1 && !(error instanceof ApiError && FINAL_KINDS.includes(error.kind)),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: { retry: 0 },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** One client per browser tab; a fresh one per server render. */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
