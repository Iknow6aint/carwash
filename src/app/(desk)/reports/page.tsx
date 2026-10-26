import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/features/reports/components/reports-view";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Reports" />
      <ReportsView />
    </>
  );
}
