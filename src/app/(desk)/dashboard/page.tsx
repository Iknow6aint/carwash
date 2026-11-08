import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { requireStaffUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireStaffUser();
  return (
    <>
      <PageHeader title="Dashboard" />
      <DashboardView />
    </>
  );
}
