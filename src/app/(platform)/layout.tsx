import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { publicEnv } from "@/config/env";
import { requireSuperAdmin } from "@/lib/auth/session";
import { SessionProvider } from "@/providers/session-provider";

/**
 * Every platform page: super admins only (`requireSuperAdmin` sends staff to their landing), in
 * the shell with the platform sidebar. Business settings are not loaded here: they belong to a
 * business, and super admins have none.
 */
export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const user = await requireSuperAdmin();
  return (
    <SessionProvider user={user}>
      <AppShell area="platform" title={publicEnv.NEXT_PUBLIC_APP_NAME}>
        {children}
      </AppShell>
    </SessionProvider>
  );
}
