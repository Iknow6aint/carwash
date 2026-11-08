import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NewTransactionForm } from "@/features/transactions/components/new-transaction-form";
import { requireStaffUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New transaction" };

export default async function NewTransactionPage() {
  await requireStaffUser();
  return (
    <>
      <PageHeader showNewTransaction={false} title="New transaction" />
      <NewTransactionForm />
    </>
  );
}
