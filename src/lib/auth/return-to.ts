/**
 * Where to send someone after signing in, and how the page they wanted travels through the login
 * redirect. Shared by the proxy, server components and client code, so it imports nothing
 * server-only or client-only.
 */

import type { Role } from "@/lib/api/schema-helpers";

/** Request header the proxy sets so server components know which page was asked for. */
export const DESK_PATH_HEADER = "x-desk-path";

export const LOGIN_PATH = "/login";
export const CHANGE_PASSWORD_PATH = "/change-password";

/** Pages that are never a place to come back to: they would loop, or are not pages at all. */
const NEVER_RETURN_TO = [LOGIN_PATH, CHANGE_PASSWORD_PATH, "/api"] as const;

/** Query parameters added by the framework that must not be replayed after sign-in. */
const INTERNAL_PARAMS = ["_rsc"];

/** Landing page per role (PROJECT_GUIDE §1): admins see the numbers, cashiers start selling. */
export function homePathForRole(role: Role): string {
  return role === "admin" ? "/dashboard" : "/new";
}

/**
 * Restricts post-sign-in navigation to a same-origin page path.
 *
 * Rejects absolute and protocol-relative URLs (`//host`, `/\host`, which browsers read as
 * `//host`), control characters, `/` (the role landing decides) and pages that would loop.
 *
 * @param value - Untrusted `returnTo` from a query string or header.
 * @returns A safe local path with its query, or `null`.
 */
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/")) return null;
  if (value.startsWith("//") || value.includes("\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;
  const path = value.split(/[?#]/, 1)[0] ?? "";
  if (path === "/") return null;
  if (NEVER_RETURN_TO.some((page) => path === page || path.startsWith(`${page}/`))) return null;
  return value;
}

/** The page a request was for (path + query, without framework parameters). */
export function returnToFromUrl(url: URL): string {
  const params = new URLSearchParams(url.search);
  for (const name of INTERNAL_PARAMS) params.delete(name);
  const query = params.toString();
  return `${url.pathname}${query ? `?${query}` : ""}`;
}

/**
 * The sign-in URL that brings the person back to `returnTo` afterwards.
 *
 * @returns `/login?returnTo=...`, or `/login` when `returnTo` is missing or unsafe.
 */
export function loginPath(returnTo?: string | null): string {
  const safe = safeReturnTo(returnTo);
  return safe ? `${LOGIN_PATH}?returnTo=${encodeURIComponent(safe)}` : LOGIN_PATH;
}

/**
 * Where a signed-in person goes next: change a temporary password first, otherwise the page they
 * asked for, otherwise their role's landing page.
 */
export function landingPath(
  user: { role: Role; mustChangePassword: boolean },
  returnTo?: string | null,
): string {
  if (user.mustChangePassword) return CHANGE_PASSWORD_PATH;
  return safeReturnTo(returnTo) ?? homePathForRole(user.role);
}
