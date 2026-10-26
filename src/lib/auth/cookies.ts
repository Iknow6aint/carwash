import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Session cookies. Both are HttpOnly: only server code (Server Actions, Route Handlers, the
 * proxy) reads or writes them, and no token ever reaches browser JavaScript.
 */
export const AUTH_COOKIE = {
  access: "cw_access",
  refresh: "cw_refresh",
} as const;

/** The refresh token lives 7 days on the API (auth.md). */
export const REFRESH_COOKIE_MAX_AGE_S = 7 * 24 * 60 * 60;

/*
 * SameSite=Lax (not Strict) so opening the desk from a bookmark or a shared link keeps the
 * session; Lax still withholds the cookies from cross-site POSTs, and Server Actions check the
 * Origin header as well.
 */
function baseOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

/** Seconds until an ISO timestamp, never negative. */
export function secondsUntil(isoDateTime: string, now: number = Date.now()): number {
  const expiresAt = Date.parse(isoDateTime);
  if (!Number.isFinite(expiresAt)) return 0;
  return Math.max(0, Math.floor((expiresAt - now) / 1000));
}

/** `cw_access`: lives exactly as long as the access token. */
export function accessCookieOptions(
  accessTokenExpiresAt: string,
  now: number = Date.now(),
): Partial<ResponseCookie> {
  return { ...baseOptions(), maxAge: secondsUntil(accessTokenExpiresAt, now) };
}

/** `cw_refresh`: 7 days. */
export function refreshCookieOptions(): Partial<ResponseCookie> {
  return { ...baseOptions(), maxAge: REFRESH_COOKIE_MAX_AGE_S };
}

/** The token pair from an `AuthSession` (login, refresh, password change). */
export interface SessionTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

/** Anything that can set cookies: `await cookies()` in an action, or `NextResponse.cookies`. */
interface CookieWriter {
  set(name: string, value: string, options?: Partial<ResponseCookie>): unknown;
}

/** Writes both session cookies. */
export function setSessionCookies(store: CookieWriter, tokens: SessionTokens): void {
  store.set(
    AUTH_COOKIE.access,
    tokens.accessToken,
    accessCookieOptions(tokens.accessTokenExpiresAt),
  );
  store.set(AUTH_COOKIE.refresh, tokens.refreshToken, refreshCookieOptions());
}
