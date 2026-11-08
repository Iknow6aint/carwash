import type { Role, StaffRole } from "@/lib/api/schema-helpers";

/**
 * Role gates for the desk UI (PROJECT_GUIDE §2 "Roles and permissions").
 *
 * Gating in the UI is a usability aid only: the API enforces every rule. Hide an action with
 * `useCan("<action>")` or `<Can action>` instead of comparing roles inline. Reads need no entry:
 * both staff roles may read the dashboard, transactions, receipts, reports, services and settings.
 * Super admins never reach the desk (the layout sends them to /platform).
 */
export const DESK_ACTIONS = {
  /** POST /transactions/:id/cancel */
  "transactions:cancel": ["admin"],
  /** POST /services, PATCH /services/:id */
  "services:manage": ["admin"],
  /** PATCH /settings/business */
  "settings:edit": ["admin"],
  /** Every /staff route (reads too: GET /staff is admin-only). */
  "staff:manage": ["admin"],
} as const satisfies Record<string, readonly StaffRole[]>;

export type DeskAction = keyof typeof DESK_ACTIONS;

export function can(role: Role, action: DeskAction): boolean {
  return (DESK_ACTIONS[action] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  cashier: "Cashier",
};

/** Staff role descriptions, word for word from the prototype's Settings & staff screen. */
export const ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  cashier: "Records payments, adjusts a price with a reason, views history and receipts.",
  admin:
    "Everything a cashier can do, plus prices, staff, business details and cancelling transactions.",
};
