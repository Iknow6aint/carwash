"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

import type { SessionUser } from "@/features/auth/schemas/auth.schema";
import { can, type DeskAction } from "@/lib/auth/access";

interface DeskSession {
  user: SessionUser;
}

const SessionContext = createContext<DeskSession | null>(null);

/**
 * Gives client components the signed-in account and its business. Mounted by the (desk) and
 * (platform) layouts with the user from `requireStaffUser()` / `requireSuperAdmin()`; it holds no
 * tokens.
 */
export function SessionProvider({ user, children }: PropsWithChildren<{ user: SessionUser }>) {
  return <SessionContext.Provider value={{ user }}>{children}</SessionContext.Provider>;
}

/** The signed-in user. Only inside the (desk) and (platform) layouts. */
export function useSession(): DeskSession {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}

/** Whether the signed-in user's role allows an action (the API enforces it regardless). */
export function useCan(action: DeskAction): boolean {
  return can(useSession().user.role, action);
}
