import { getServerEnv } from "@/config/env";
import { authSessionSchema } from "@/features/auth/schemas/auth.schema";
import { API_ROUTES } from "@/lib/api/endpoints";
import { serverToServerHeaders } from "@/lib/api/server-headers";

import type { SessionTokens } from "./cookies";

/**
 * Session renewal for the proxy (src/proxy.ts).
 *
 * The access token lives 15 minutes and the refresh token 7 days. Renewal happens in the proxy,
 * before any page renders, because only the proxy, Route Handlers and Server Actions may write
 * cookies. Refresh tokens rotate on every use and presenting a spent one revokes every session of
 * that user (auth.md), so a burst of requests carrying the same expiring session (a page plus its
 * prefetches, two tabs) must share one rotation: {@link createRefreshCoordinator} does that.
 *
 * Nothing here imports `server-only`: the proxy runs on the Node.js runtime but outside the React
 * server graph.
 */

/** Renew this long before the access token expires, so a page never renders with a dying token. */
export const ACCESS_TOKEN_SKEW_MS = 60_000;

/** How long a rotation's result is shared with requests that still carry the old refresh token. */
export const ROTATION_REUSE_MS = 30_000;

/** How long a refresh token the API rejected is remembered, so it is not retried every request. */
export const REJECTED_TOKEN_MS = 60_000;

const REFRESH_TIMEOUT_MS = 8_000;
const MAX_ENTRIES = 500;

export type ProxyRoute = "protected" | "login";

/** What the proxy does with one request. */
export type ProxyAction =
  /** Let the request through untouched. */
  | "continue"
  /** Rotate the refresh token first, then continue with the new cookies. */
  | "refresh"
  /** Send the browser to sign in, remembering the page it asked for. */
  | "login";

export type RefreshOutcome =
  | { ok: true; tokens: SessionTokens }
  /** `rejected`: the API refused the token (spent, revoked, user deactivated). */
  | { ok: false; reason: "rejected" | "unavailable" };

/**
 * Reads a JWT's `exp` claim without verifying it (auth.md: clients may rely on `exp` only). Used
 * just to decide when to renew; the API verifies every token it receives.
 *
 * @returns Expiry in epoch milliseconds, or null when the token cannot be read.
 */
export function accessTokenExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const claims: unknown = JSON.parse(atob(padded));
    if (
      typeof claims === "object" &&
      claims !== null &&
      "exp" in claims &&
      typeof claims.exp === "number" &&
      Number.isFinite(claims.exp)
    ) {
      return claims.exp * 1000;
    }
  } catch {
    return null;
  }
  return null;
}

/** False when missing, unreadable, expired, or expiring within {@link ACCESS_TOKEN_SKEW_MS}. */
export function isAccessTokenFresh(token: string | undefined, now: number): boolean {
  if (!token) return false;
  const expiry = accessTokenExpiry(token);
  return expiry !== null && expiry - ACCESS_TOKEN_SKEW_MS > now;
}

/**
 * Decides what the proxy does from the two cookies alone. Whether the access token is really
 * valid (not revoked, user still active) is checked by `requireUser()` with `GET /auth/me`.
 */
export function decideProxyAction(input: {
  route: ProxyRoute;
  accessToken?: string;
  refreshToken?: string;
  now: number;
}): ProxyAction {
  if (isAccessTokenFresh(input.accessToken, input.now)) return "continue";
  if (input.refreshToken) return "refresh";
  // The sign-in page renders for signed-out visitors; every other page needs a session.
  return input.route === "login" ? "continue" : "login";
}

interface Entry {
  promise: Promise<RefreshOutcome>;
  /** Infinity while the rotation is in flight. */
  expiresAt: number;
}

/**
 * Shares one rotation between every request that carries the same refresh token.
 *
 * - Concurrent calls with the same token wait for a single API call (single flight).
 * - A success is reused for {@link ROTATION_REUSE_MS}, so a request that left the browser before
 *   the new cookies arrived gets the same new pair instead of spending the old token again
 *   (which the API would treat as reuse and sign the user out everywhere).
 * - A rejected token is remembered for {@link REJECTED_TOKEN_MS}; an unreachable API is not, so
 *   the next request tries again.
 *
 * Tokens are kept only as SHA-256 digests. The cache is per server instance.
 *
 * @returns `rotate(refreshToken, clientIp?)`, which never throws. Requests that join a rotation
 * already in flight share its result (and the first request's client IP).
 */
export function createRefreshCoordinator(options: {
  refresh: (refreshToken: string, clientIp?: string) => Promise<RefreshOutcome>;
  now?: () => number;
  reuseMs?: number;
  rejectedMs?: number;
}) {
  const {
    refresh,
    now = Date.now,
    reuseMs = ROTATION_REUSE_MS,
    rejectedMs = REJECTED_TOKEN_MS,
  } = options;
  const entries = new Map<string, Entry>();

  function prune(time: number) {
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= time) entries.delete(key);
    }
    while (entries.size >= MAX_ENTRIES) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }
  }

  return async function rotate(refreshToken: string, clientIp?: string): Promise<RefreshOutcome> {
    const key = await digest(refreshToken);
    const time = now();
    const hit = entries.get(key);
    if (hit && hit.expiresAt > time) return hit.promise;
    prune(time);

    const entry: Entry = {
      expiresAt: Number.POSITIVE_INFINITY,
      promise: refresh(refreshToken, clientIp)
        .catch((): RefreshOutcome => ({ ok: false, reason: "unavailable" }))
        .then((outcome) => {
          if (entries.get(key) === entry) {
            if (outcome.ok) entry.expiresAt = now() + reuseMs;
            else if (outcome.reason === "rejected") entry.expiresAt = now() + rejectedMs;
            else entries.delete(key);
          }
          return outcome;
        }),
    };
    entries.set(key, entry);
    return entry.promise;
  };
}

/**
 * Calls `POST /auth/refresh` with `{ refreshToken }`, plus `X-Security-Key` and the browser's
 * `X-Client-Ip` (the API rate-limits refresh per browser IP).
 *
 * @param clientIp - From the proxy's `request.headers` (`headers()` is not available there).
 * @returns The new pair, `rejected` for a 4xx answer (except 429), `unavailable` otherwise.
 */
export async function requestRefresh(
  refreshToken: string,
  clientIp?: string,
): Promise<RefreshOutcome> {
  const environment = getServerEnv();
  try {
    const response = await fetch(`${environment.API_INTERNAL_BASE_URL}${API_ROUTES.auth.refresh}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...serverToServerHeaders(environment, clientIp),
      },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });
    const payload: unknown = await response.json().catch(() => null);
    const tokens = readTokens(payload);
    if (response.ok && tokens) return { ok: true, tokens };
    // 429 (throttled) and 5xx are temporary; any other 4xx means this token will never work.
    return response.status >= 400 && response.status < 500 && response.status !== 429
      ? { ok: false, reason: "rejected" }
      : { ok: false, reason: "unavailable" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

function readTokens(payload: unknown): SessionTokens | null {
  if (typeof payload !== "object" || payload === null) return null;
  if (!("status" in payload) || payload.status !== 1 || !("data" in payload)) return null;
  const parsed = authSessionSchema.safeParse(payload.data);
  if (!parsed.success) return null;
  const { accessToken, accessTokenExpiresAt, refreshToken } = parsed.data;
  return { accessToken, accessTokenExpiresAt, refreshToken };
}

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
