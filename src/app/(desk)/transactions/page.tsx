import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { TransactionsView } from "@/features/transactions/components/transactions-view";
import { parseTransactionFilters } from "@/features/transactions/utils/transaction-filters";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  return (
    <>
      <PageHeader title="Transactions" />
      <TransactionsView initialFilters={parseTransactionFilters(await searchParams)} />
    </>
  );
}
