/**
 * Where to send someone after signing in, and how the page they wanted travels through the login
 * redirect. Shared by the proxy, server components and client code, so it imports nothing
 * server-only or client-only.
 */

import type { BusinessStatus, Role } from "@/lib/api/schema-helpers";

/** Request header the proxy sets so server components know which page was asked for. */
export const DESK_PATH_HEADER = "x-desk-path";

export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/register";
export const CHANGE_PASSWORD_PATH = "/change-password";
/** Staff of a pending or suspended business wait here instead of the desk. */
export const BUSINESS_STATUS_PATH = "/business-status";
/** The super admin area. */
export const PLATFORM_PATH = "/platform";
/** The platform's businesses list (the landing is the overview). */
export const PLATFORM_BUSINESSES_PATH = "/platform/businesses";

/** Pages that are never a place to come back to: they would loop, or are not pages at all. */
const NEVER_RETURN_TO = [
  LOGIN_PATH,
  REGISTER_PATH,
  CHANGE_PASSWORD_PATH,
  BUSINESS_STATUS_PATH,
  "/api",
] as const;

/** Query parameters added by the framework that must not be replayed after sign-in. */
const INTERNAL_PARAMS = ["_rsc"];

/** What landing decisions need to know about the signed-in account (a `SessionUser` fits). */
export interface LandingUser {
  role: Role;
  mustChangePassword: boolean;
  business: { status: BusinessStatus } | null;
}

function isUnder(path: string, base: string): boolean {
  return path === base || path.startsWith(`${base}/`);
}

/**
 * Landing page per role (PROJECT_GUIDE §1): super admins run the platform, admins see the numbers,
 * cashiers start selling.
 */
export function homePathForRole(role: Role): string {
  if (role === "super_admin") return PLATFORM_PATH;
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
  const path = pagePath(value);
  if (path === "/") return null;
  if (NEVER_RETURN_TO.some((page) => isUnder(path, page))) return null;
  return value;
}

/** The path part of a local URL (no query or hash). */
function pagePath(value: string): string {
  return value.split(/[?#]/, 1)[0] ?? "";
}

/** True when `path` is in the area the role works in: /platform for super admins, the desk otherwise. */
export function isInRoleArea(role: Role, path: string): boolean {
  const platform = isUnder(pagePath(path), PLATFORM_PATH);
  return role === "super_admin" ? platform : !platform;
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
 * Where a signed-in person goes next, in this order: change a temporary password; staff of a
 * business that is not active wait on the status page; the page they asked for, if it is in their
 * area; otherwise their role's landing page.
 */
export function landingPath(user: LandingUser, returnTo?: string | null): string {
  if (user.mustChangePassword) return CHANGE_PASSWORD_PATH;
  if (user.role !== "super_admin" && user.business?.status !== "active") {
    return BUSINESS_STATUS_PATH;
  }
  const safe = safeReturnTo(returnTo);
  return safe && isInRoleArea(user.role, safe) ? safe : homePathForRole(user.role);
}

/**
 * Where to send someone who opened a desk page, or `null` when the desk is theirs: staff of an
 * active business with their own password. Never a desk path, so it cannot loop.
 */
export function deskRedirect(user: LandingUser): string | null {
  const allowed =
    user.role !== "super_admin" && !user.mustChangePassword && user.business?.status === "active";
  return allowed ? null : landingPath(user);
}

/**
 * Where to send someone who opened a platform page, or `null` for a super admin with their own
 * password. Never a platform path, so it cannot loop.
 */
export function platformRedirect(user: LandingUser): string | null {
  const allowed = user.role === "super_admin" && !user.mustChangePassword;
  return allowed ? null : landingPath(user);
}
