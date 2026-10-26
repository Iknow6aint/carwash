"use client";

import Link from "next/link";
import { useState } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { buttonVariants } from "@/components/ui/button";
import { MethodSplitBar } from "@/components/ui/method-split-bar";
import { Seg, type SegOption } from "@/components/ui/seg";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile, StatTileSkeleton } from "@/components/ui/stat-tile";
import { TableSkeleton } from "@/components/ui/table";
import { ReceiptDialog } from "@/features/transactions/components/receipt-dialog";
import type { Transaction } from "@/features/transactions/schemas/transaction.schema";
import { formatNaira } from "@/lib/format/money";
import { plural } from "@/lib/format/text";
import { cn } from "@/lib/utils";

import { useDashboard } from "../hooks/use-dashboard";
import type { Dashboard, DashboardPeriod } from "../schemas/dashboard.schema";

import { BestSellers, RecordedBy } from "./dashboard-lists";
import { RecentTransactions } from "./recent-transactions";

const PERIOD_OPTIONS: readonly SegOption<DashboardPeriod>[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
};

function periodNote(dashboard: Dashboard): string {
  return dashboard.cancelledCount
    ? `${plural(dashboard.cancelledCount, "cancelled transaction")} excluded from totals`
    : "Totals update as each payment is saved";
}

/**
 * Dashboard: how many cars, how much money, the payment-method split, recent transactions, best
 * sellers and who recorded what, for today, this week or this month.
 */
export function DashboardView() {
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const dashboard = useDashboard(period);
  const data = dashboard.data;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3.5">
        <Seg label="Period" onChange={setPeriod} options={PERIOD_OPTIONS} value={period} />
        <span aria-live="polite" className="text-[13px] text-neutral-700">
          {data ? periodNote(data) : null}
        </span>
      </div>

      {dashboard.isError && !data ? (
        <ErrorState
          error={dashboard.error}
          onRetry={() => void dashboard.refetch()}
          title="The dashboard didn't load."
        />
      ) : (
        <div
          aria-busy={dashboard.isFetching || undefined}
          className={cn(
            "flex flex-col gap-7 transition-opacity",
            dashboard.isPlaceholderData && "opacity-60",
          )}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {data ? (
              <>
                <StatTile
                  helper="All paid transactions"
                  label={`${PERIOD_LABELS[data.period]} revenue`}
                  value={formatNaira(data.revenueKobo)}
                />
                <StatTile
                  helper={`Average ${formatNaira(data.averageKobo)} per car`}
                  label="Cars washed"
                  value={data.carsWashed}
                />
                <StatTile className="gap-3" label="By payment method">
                  <MethodSplitBar methods={data.methods} />
                </StatTile>
              </>
            ) : (
              <>
                <StatTileSkeleton />
                <StatTileSkeleton />
                <StatTileSkeleton />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-start gap-7">
            <section className="flex min-w-0 flex-[2_1_440px] flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <h3>Recent transactions</h3>
                <Link className={buttonVariants({ variant: "ghost" })} href="/transactions">
                  View all
                </Link>
              </div>
              {data ? (
                <RecentTransactions onOpen={setReceipt} transactions={data.recent} />
              ) : (
                <TableSkeleton columns={6} label="Loading recent transactions" rows={7} />
              )}
            </section>
            <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-7">
              <section className="flex flex-col gap-2.5">
                <h3>Best-selling services</h3>
                {data ? <BestSellers services={data.topServices} /> : <ListSkeleton />}
              </section>
              <section className="flex flex-col gap-2">
                <h3>Recorded by</h3>
                {data ? <RecordedBy staff={data.staff} /> : <ListSkeleton />}
              </section>
            </div>
          </div>
        </div>
      )}

      <ReceiptDialog onClose={() => setReceipt(null)} transaction={receipt} />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton className="h-5 w-full" key={index} />
      ))}
    </div>
  );
}
