/**
 * Every API route the desk calls, relative to `API_INTERNAL_BASE_URL` (which ends in `/v1`).
 *
 * One section per domain, copied from `carwash-api/docs/api/<module>.md`. Routes with path
 * parameters are functions. Never build a route string in a component or service; add it here.
 * Query strings go through {@link withQuery}.
 */
export const API_ROUTES = {
  /** auth.md */
  auth: {
    /** `POST { email, password }` → AuthSession. Public. */
    login: "/auth/login",
    /** `POST { refreshToken }` → AuthSession (rotates). Public. */
    refresh: "/auth/refresh",
    /** `POST { refreshToken }` → null. Public, idempotent. */
    logout: "/auth/logout",
    /** `GET` → User. */
    me: "/auth/me",
    /** `POST { currentPassword, newPassword }` → AuthSession. */
    password: "/auth/password",
  },
  /** staff.md (admin only) */
  staff: {
    /** `GET` → StaffMember[]; `POST { name, email, role, temporaryPassword }` → User. */
    list: "/staff",
    /** `PATCH { name?, role? }` → User. */
    detail: (id: string) => `/staff/${encodeURIComponent(id)}`,
    /** `POST` → User. */
    deactivate: (id: string) => `/staff/${encodeURIComponent(id)}/deactivate`,
    /** `POST` → User. */
    reactivate: (id: string) => `/staff/${encodeURIComponent(id)}/reactivate`,
    /** `POST { temporaryPassword }` → User. */
    resetPassword: (id: string) => `/staff/${encodeURIComponent(id)}/reset-password`,
  },
  /** services.md */
  services: {
    /** `GET ?active` → Service[]; `POST { name, priceKobo }` (admin) → Service. */
    list: "/services",
    /** `PATCH { name?, priceKobo?, isActive?, sortOrder? }` (admin) → Service. */
    detail: (id: string) => `/services/${encodeURIComponent(id)}`,
  },
  /** transactions.md */
  transactions: {
    /** `GET ?q&range&from&to&method&status&page&limit`; `POST` (Idempotency-Key) → Transaction. */
    list: "/transactions",
    /** `GET` → Transaction (receipt data). */
    detail: (id: string) => `/transactions/${encodeURIComponent(id)}`,
    /** `POST { reason }` (admin) → Transaction. */
    cancel: (id: string) => `/transactions/${encodeURIComponent(id)}/cancel`,
    /** `GET` same filters → text/csv. */
    export: "/transactions/export",
  },
  /** reports.md */
  dashboard: {
    /** `GET ?period=today|week|month` → Dashboard. */
    summary: "/dashboard",
  },
  /** reports.md */
  reports: {
    /** `GET ?range=week|month|30d` → Report. */
    summary: "/reports",
    /** `GET ?range` → text/csv. */
    dailyTotalsExport: "/reports/daily-totals/export",
  },
  /** settings.md */
  settings: {
    /** `GET` → BusinessSettings; `PATCH` (admin) → BusinessSettings. */
    business: "/settings/business",
  },
} as const;

type QueryValue = string | number | boolean | null | undefined;

/**
 * Appends a query string, dropping empty values.
 *
 * @example withQuery(API_ROUTES.transactions.list, { range: "7d", q: "" }) // "/transactions?range=7d"
 */
export function withQuery(route: string, query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${route}?${search}` : route;
}
