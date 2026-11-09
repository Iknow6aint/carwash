import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformRevenueView } from "@/features/platform/components/platform-revenue-view";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Revenue" };

export default async function PlatformRevenuePage() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Revenue" />
      <PlatformRevenueView />
    </>
  );
}
