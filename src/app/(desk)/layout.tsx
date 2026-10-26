import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getBusinessSettings } from "@/features/settings/services/settings.service";
import { queryKeys } from "@/lib/api/query-keys";
import { CHANGE_PASSWORD_PATH } from "@/lib/auth/return-to";
import { requireUser } from "@/lib/auth/session";
import { SessionProvider } from "@/providers/session-provider";

/**
 * Every signed-in desk page: requires a user (temporary password first), then the shell.
 *
 * Business settings (the sidebar name, receipts, the transfer/POS confirmation rule) are fetched
 * here once and handed to the client cache, so the shell and pages render the same thing on the
 * server and while hydrating. If they fail to load, the client simply fetches them itself.
 */
export default async function DeskLayout({ children }: { children: ReactNode }) {
  const [user, settings] = await Promise.all([requireUser(), getBusinessSettings()]);
  if (user.mustChangePassword) redirect(CHANGE_PASSWORD_PATH);

  const queryClient = new QueryClient();
  if (settings.ok) queryClient.setQueryData(queryKeys.settings.business(), settings.data);

  return (
    <SessionProvider user={user}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AppShell>{children}</AppShell>
      </HydrationBoundary>
    </SessionProvider>
  );
}
