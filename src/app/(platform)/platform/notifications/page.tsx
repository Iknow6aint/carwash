import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformNotificationsView } from "@/features/platform/components/platform-notifications-view";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Notifications" };

export default async function PlatformNotificationsPage() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Notifications" />
      <PlatformNotificationsView />
    </>
  );
}
