import type { Metadata } from "next";
import Link from "next/link";

import { Notice } from "@/components/feedback/notice";
import { PageHeader } from "@/components/layout/page-header";
import { Blueprint } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Withdrawals" };

/**
 * Business payout requests. The wallet and bank-transfer integration belong to the payments
 * phase; this page explains the state and points at the payout limits in Platform settings.
 */
export default async function PlatformWithdrawalsPage() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Withdrawals" />
      <div className="flex max-w-[760px] flex-col gap-4">
        <Notice>
          Payouts are not enabled yet. Withdrawal limits and the hold-for-review threshold can be
          configured now in Platform settings; requests will appear here once business wallets
          launch.
        </Notice>
        <Blueprint className="flex flex-col gap-3 p-6">
          <h2 className="m-0 text-[25px]">No withdrawals</h2>
          <p className="m-0 text-[14px] leading-[1.55] text-neutral-800">
            When a business asks to withdraw its available balance, the request will appear here
            with the bank account, amount and two-step verification status. You can release, hold
            for review or reject it.
          </p>
          <Link
            className={buttonVariants({ variant: "secondary", className: "self-start" })}
            href="/platform/settings"
          >
            Payout settings
          </Link>
        </Blueprint>
      </div>
    </>
  );
}
