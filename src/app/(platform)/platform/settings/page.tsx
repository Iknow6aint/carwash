import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformSettingsView } from "@/features/platform/components/platform-settings-view";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Platform settings" };

export default async function PlatformSettingsPage() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Platform settings" />
      <PlatformSettingsView />
    </>
  );
}
