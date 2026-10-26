import { isServer, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { loginPath } from "@/lib/auth/return-to";

import { ApiError, type ApiErrorKind } from "./api-error";

/** Errors that will not change on a retry. */
const FINAL_KINDS: readonly ApiErrorKind[] = [
  "unauthorized",
  "forbidden",
  "not-found",
  "validation",
  "conflict",
];

/**
 * When a session can no longer be renewed (the proxy already tried), a data call answers
 * `unauthorized`: send the tablet back to sign in, then to the same page.
 */
function signInAgainOnUnauthorized(error: unknown) {
  if (typeof window === "undefined") return;
  if (error instanceof ApiError && error.kind === "unauthorized") {
    window.location.assign(loginPath(`${window.location.pathname}${window.location.search}`));
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: signInAgainOnUnauthorized }),
    mutationCache: new MutationCache({ onError: signInAgainOnUnauthorized }),
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
