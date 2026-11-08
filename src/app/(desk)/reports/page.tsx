import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/features/reports/components/reports-view";
import { requireStaffUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requireStaffUser();
  return (
    <>
      <PageHeader title="Reports" />
      <ReportsView />
    </>
  );
}
