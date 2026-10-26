import "server-only";

import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

import { userSchema, type User } from "@/features/auth/schemas/auth.schema";
import { ApiError, TRANSPORT_MESSAGES } from "@/lib/api/api-error";
import { API_ROUTES } from "@/lib/api/endpoints";
import { backendRequest } from "@/lib/api/server-api-client";

import { AUTH_COOKIE } from "./cookies";
import { DESK_PATH_HEADER, landingPath, loginPath } from "./return-to";

/**
 * Loads `GET /auth/me` for one access token.
 *
 * @returns The user, or `null` when the API says the token is no good (401/403: expired, revoked,
 * deactivated, token version changed).
 * @throws ApiError when the API is unreachable or answers in an unexpected shape, so the page shows
 * an error with Retry instead of a misleading sign-in screen.
 */
async function loadUser(accessToken: string): Promise<User | null> {
  try {
    const { response } = await backendRequest<unknown>(API_ROUTES.auth.me, { accessToken });
    return userSchema.parse(response.data);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.kind === "unauthorized" || error.kind === "forbidden")
    ) {
      return null;
    }
    if (error instanceof z.ZodError) {
      throw new ApiError(TRANSPORT_MESSAGES.shape, 502, "server");
    }
    throw error;
  }
}

/**
 * The signed-in user, or `null`. Runs once per request (`React.cache`): layouts and pages share it.
 *
 * It never renews the session, because cookies cannot be written while a page renders. The proxy
 * (src/proxy.ts) renews an expiring access token before rendering starts.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const accessToken = (await cookies()).get(AUTH_COOKIE.access)?.value;
  if (!accessToken) return null;
  return loadUser(accessToken);
});

/**
 * The signed-in user; otherwise redirects to sign in and back to the page that was asked for (the
 * proxy passes it in {@link DESK_PATH_HEADER}). This is the real access check; the proxy is only an
 * optimisation, and the API enforces roles on every call regardless.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath((await headers()).get(DESK_PATH_HEADER)));
  return user;
}

/**
 * For the sign-in page: sends someone who is already signed in straight on (temporary password
 * first, then `returnTo`, then their role's landing page).
 */
export async function redirectIfSignedIn(returnTo: string | null | undefined): Promise<void> {
  const user = await getCurrentUser().catch((error: unknown) => {
    unstable_rethrow(error);
    // The API being down must not block signing in; the form will report it.
    return null;
  });
  if (user) redirect(landingPath(user, returnTo));
}
