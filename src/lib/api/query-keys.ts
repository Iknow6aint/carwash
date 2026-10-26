/**
 * TanStack Query keys, one section per domain (the same domains as `API_ROUTES`).
 *
 * Every key starts with its domain's `all`, so `invalidateQueries({ queryKey:
 * queryKeys.transactions.all })` refreshes the whole domain after a write. Filters go last as an
 * object. Never write a key inline in a hook.
 */
export const queryKeys = {
  staff: {
    all: ["staff"] as const,
    list: () => [...queryKeys.staff.all, "list"] as const,
  },
  services: {
    all: ["services"] as const,
    list: (filters: { active?: boolean }) => [...queryKeys.services.all, "list", filters] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (filters: object) => [...queryKeys.transactions.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all, "detail", id] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: (period: string) => [...queryKeys.dashboard.all, "summary", period] as const,
  },
  reports: {
    all: ["reports"] as const,
    summary: (range: string) => [...queryKeys.reports.all, "summary", range] as const,
  },
  settings: {
    all: ["settings"] as const,
    business: () => [...queryKeys.settings.all, "business"] as const,
  },
} as const;
