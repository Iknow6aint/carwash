import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformTransactionsView } from "@/features/platform/components/platform-transactions-view";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Transactions" };

export default async function PlatformTransactionsPage() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Transactions" />
      <PlatformTransactionsView />
    </>
  );
}
