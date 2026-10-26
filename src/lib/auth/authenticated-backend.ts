import "server-only";

import { cookies } from "next/headers";

import { ApiError } from "@/lib/api/api-error";
import { backendRequest, type BackendRequestOptions } from "@/lib/api/server-api-client";

import { AUTH_COOKIE } from "./cookies";

/** Same message as the API's `UNAUTHENTICATED`, for a request that never had a session. */
const SESSION_ENDED_MESSAGE = "Your session has ended. Sign in again.";

/**
 * Calls a protected API route with the user's HttpOnly access cookie as the Bearer token. Use it
 * in every `"use server"` feature service; never read the cookie anywhere else.
 *
 * @param route - Route from `API_ROUTES` (use `withQuery` for query strings).
 * @param options - Method, JSON body, and `idempotencyKey` for `POST /transactions`.
 * @throws ApiError `unauthorized` when there is no access cookie, or the API's own error.
 */
export async function authenticatedBackendRequest<T>(
  route: string,
  options: Omit<BackendRequestOptions, "accessToken"> = {},
) {
  return backendRequest<T>(route, { ...options, accessToken: await requireAccessToken() });
}

async function requireAccessToken(): Promise<string> {
  const accessToken = (await cookies()).get(AUTH_COOKIE.access)?.value;
  if (!accessToken) {
    throw new ApiError(SESSION_ENDED_MESSAGE, 401, "unauthorized", undefined, "UNAUTHENTICATED");
  }
  return accessToken;
}
