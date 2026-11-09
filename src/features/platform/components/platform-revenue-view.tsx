"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Notice } from "@/components/feedback/notice";
import { StatTile, StatTileSkeleton } from "@/components/ui/stat-tile";
import { formatNaira } from "@/lib/format/money";
import { plural } from "@/lib/format/text";

import { usePlatformRevenue } from "../hooks/use-platform";

/** Calculated platform fees over 12 months, with the top businesses by fees. */
export function PlatformRevenueView() {
  const revenue = usePlatformRevenue();
  const data = revenue.data;

  if (revenue.isError && !data) {
    return (
      <ErrorState
        error={revenue.error}
        onRetry={() => void revenue.refetch()}
        title="Revenue didn't load."
      />
    );
  }

  const max = Math.max(1, ...(data?.months.map((month) => month.feesKobo) ?? [1]));
  const topMax = Math.max(1, ...(data?.topBusinesses.map((business) => business.feesKobo) ?? [1]));

  return (
    <div className="flex flex-col gap-7">
      <Notice>
        Fees are calculated from the platform fee setting. This is a reporting figure; the API does
        not move or collect money.
      </Notice>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        {data ? (
          <>
            <StatTile
              helper="Calculated, not collected"
              label="Fees · 12 months"
              size="md"
              value={formatNaira(data.totals.fees12MonthsKobo)}
            />
            <StatTile
              helper={`${plural(data.totals.transactions12Months, "paid sale")}`}
              label="Transactions · 12 months"
              size="md"
              value={data.totals.transactions12Months}
            />
            <StatTile
              helper="Calculated, not collected"
              label="Fees · 30 days"
              size="md"
              value={formatNaira(data.totals.fees30DaysKobo)}
            />
            <StatTile
              helper={
                data.fee.payer === "customer"
                  ? "Added to the customer"
                  : "Deducted from the business"
              }
              label="Fee per sale"
              size="md"
              value={formatNaira(data.fee.perTransactionKobo)}
            />
          </>
        ) : (
          <>
            <StatTileSkeleton size="md" />
            <StatTileSkeleton size="md" />
            <StatTileSkeleton size="md" />
            <StatTileSkeleton size="md" />
          </>
        )}
      </div>

      {data ? (
        <div className="flex flex-wrap gap-7">
          <section
            aria-label="Fees by month"
            className="flex min-w-0 flex-[2_1_440px] flex-col gap-3"
          >
            <h2 className="m-0 text-[25px]">Fees · 12 months</h2>
            <div className="flex h-[200px] items-end gap-1.5 border-b border-text">
              {data.months.map((month) => (
                <div
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                  key={month.month}
                  title={`${month.label}: ${formatNaira(month.feesKobo)} · ${month.transactions} sales`}
                >
                  <div
                    className="w-full bg-accent"
                    style={{ height: `${Math.max(2, (month.feesKobo / max) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              {data.months.map((month) => (
                <span
                  className="min-w-0 flex-1 text-center text-[10px] text-neutral-700"
                  key={month.month}
                >
                  {month.label}
                </span>
              ))}
            </div>
          </section>

          <section
            aria-label="Top businesses by fees"
            className="flex min-w-0 flex-[1_1_300px] flex-col gap-3"
          >
            <h2 className="m-0 text-[25px]">Top businesses · 30 days</h2>
            {data.topBusinesses.length === 0 ? (
              <p className="text-[14px] text-neutral-700">No paid sales in the last 30 days.</p>
            ) : (
              data.topBusinesses.map((business) => (
                <div className="flex flex-col gap-1.5" key={business.id}>
                  <div className="flex gap-2 text-[14px]">
                    <span className="min-w-0 flex-1 truncate">{business.name}</span>
                    <span className="text-neutral-700">{business.transactions} sales</span>
                    <span className="min-w-[84px] text-right font-medium tabular-nums">
                      {formatNaira(business.feesKobo)}
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-300">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${(business.feesKobo / topMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
