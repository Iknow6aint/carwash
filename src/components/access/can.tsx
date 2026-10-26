"use client";

import type { ReactNode } from "react";

import type { DeskAction } from "@/lib/auth/access";
import { useCan } from "@/providers/session-provider";

/**
 * Renders `children` only when the signed-in user's role allows `action`; otherwise `fallback`.
 * Use it to hide admin-only actions from cashiers (the API enforces roles regardless).
 *
 * @example <Can action="transactions:cancel" fallback={<p>Need to cancel? Ask an admin.</p>}>...</Can>
 */
export function Can({
  action,
  children,
  fallback = null,
}: {
  action: DeskAction;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useCan(action) ? children : fallback;
}
