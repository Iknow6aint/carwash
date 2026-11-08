import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { DeskShell } from "@/components/layout/desk-shell";
import { getBusinessSettings } from "@/features/settings/services/settings.service";
import { queryKeys } from "@/lib/api/query-keys";
import { requireStaffUser } from "@/lib/auth/session";
import { SessionProvider } from "@/providers/session-provider";

/**
 * Every signed-in desk page: requires staff of an active business with their own password
 * (`requireStaffUser` sends super admins, temporary passwords and pending or suspended businesses
 * elsewhere), then the shell.
 *
 * Business settings (the sidebar name, receipts, the transfer/POS confirmation rule) are fetched
 * here once and handed to the client cache, so the shell and pages render the same thing on the
 * server and while hydrating. If they fail to load, the client simply fetches them itself.
 */
export default async function DeskLayout({ children }: { children: ReactNode }) {
  const [user, settings] = await Promise.all([requireStaffUser(), getBusinessSettings()]);

  const queryClient = new QueryClient();
  if (settings.ok) queryClient.setQueryData(queryKeys.settings.business(), settings.data);

  return (
    <SessionProvider user={user}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DeskShell>{children}</DeskShell>
      </HydrationBoundary>
    </SessionProvider>
  );
}
