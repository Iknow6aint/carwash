import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SettingsView } from "@/features/settings/components/settings-view";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings & staff" };

export default async function SettingsPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Settings & staff" />
      <SettingsView />
    </>
  );
}
