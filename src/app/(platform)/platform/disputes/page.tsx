import type { Metadata } from "next";
import Link from "next/link";

import { Notice } from "@/components/feedback/notice";
import { PageHeader } from "@/components/layout/page-header";
import { Blueprint } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Disputes & refunds" };

/**
 * Customer dispute cases. The report/resolve workflow needs the payments phase (a customer report
 * link and refund ledger), so no cases can exist yet. The page explains the state instead of
 * showing invented data.
 */
export default async function PlatformDisputesPage() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Disputes & refunds" />
      <div className="flex max-w-[760px] flex-col gap-4">
        <Notice>
          Customer dispute reporting is not enabled yet. It opens with online payments and refunds;
          until then, use the transaction list and support channels.
        </Notice>
        <Blueprint className="flex flex-col gap-3 p-6">
          <h2 className="m-0 text-[25px]">No disputes</h2>
          <p className="m-0 text-[14px] leading-[1.55] text-neutral-800">
            When a customer reports a problem from a receipt, the case will appear here with the
            transaction, the evidence and actions to refund, confirm or reject it.
          </p>
          <Link
            className={buttonVariants({ variant: "secondary", className: "self-start" })}
            href="/platform/transactions"
          >
            Open transactions
          </Link>
        </Blueprint>
      </div>
    </>
  );
}
