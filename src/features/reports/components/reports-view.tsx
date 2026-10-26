"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { buttonVariants } from "@/components/ui/button";
import { Seg, type SegOption } from "@/components/ui/seg";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile, StatTileSkeleton } from "@/components/ui/stat-tile";
import { TableSkeleton } from "@/components/ui/table";
import { formatNaira } from "@/lib/format/money";
import { cn } from "@/lib/utils";

import { useReport } from "../hooks/use-report";
import type { Report, ReportRange } from "../schemas/report.schema";
import { rangeText } from "../utils/chart";

import { DailyTotalsTable, ServicesReportTable, StaffReportTable } from "./report-tables";
import { RevenueChart } from "./revenue-chart";

const RANGE_OPTIONS: readonly SegOption<ReportRange>[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "30d", label: "Last 30 days" },
];

function Kpis({ report }: { report: Report }) {
  const { kpis } = report;
  return (
    <>
      <StatTile
        helper="Paid transactions only"
        label="Revenue"
        size="md"
        value={formatNaira(kpis.revenueKobo)}
      />
      <StatTile
        helper={`Avg ${kpis.averageCarsPerDay} a day`}
        label="Cars washed"
        size="md"
        value={kpis.carsWashed}
      />
      <StatTile
        helper="Revenue per day open"
        label="Daily average"
        size="md"
        value={formatNaira(kpis.dailyAverageKobo)}
      />
      <StatTile
        helper={`${kpis.adjustedCount} adjusted · ${kpis.cancelledCount} cancelled`}
        label="Adjustments"
        size="md"
        value={formatNaira(kpis.adjustmentTotalKobo)}
      />
    </>
  );
}

/** Reports: KPIs, revenue by day by method, services, staff and daily totals for a range. */
export function ReportsView() {
  const [range, setRange] = useState<ReportRange>("week");
  const report = useReport(range);
  const data = report.data;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3.5">
        <Seg label="Report range" onChange={setRange} options={RANGE_OPTIONS} value={range} />
        <span aria-live="polite" className="text-[13px] text-neutral-700">
          {data ? rangeText(data.from, data.to, data.dayCount) : null}
        </span>
        <a
          className={buttonVariants({
            variant: "secondary",
            className: "ml-auto text-text hover:text-text",
          })}
          href={`/api/export/daily-totals?range=${range}`}
        >
          <Download aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Export daily totals
        </a>
      </div>

      {report.isError && !data ? (
        <ErrorState
          error={report.error}
          onRetry={() => void report.refetch()}
          title="The report didn't load."
        />
      ) : (
        <div
          aria-busy={report.isFetching || undefined}
          className={cn(
            "flex flex-col gap-7 transition-opacity",
            report.isPlaceholderData && "opacity-60",
          )}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5">
            {data ? (
              <Kpis report={data} />
            ) : (
              Array.from({ length: 4 }, (_, index) => <StatTileSkeleton key={index} size="md" />)
            )}
          </div>

          {data ? <RevenueChart report={data} /> : <Skeleton className="h-[240px] w-full" />}

          <div className="flex flex-wrap items-start gap-7">
            <section className="flex min-w-0 flex-[1_1_380px] flex-col gap-2.5">
              <h3>Services</h3>
              {data ? (
                <ServicesReportTable services={data.services} />
              ) : (
                <TableSkeleton columns={4} rows={5} />
              )}
            </section>
            <section className="flex min-w-0 flex-[1_1_380px] flex-col gap-2.5">
              <h3>Staff</h3>
              {data ? (
                <StaffReportTable staff={data.staff} />
              ) : (
                <TableSkeleton columns={4} rows={3} />
              )}
            </section>
          </div>

          <section className="flex flex-col gap-2.5">
            <h3>Daily totals</h3>
            {data ? <DailyTotalsTable days={data.days} /> : <TableSkeleton columns={7} rows={7} />}
          </section>
        </div>
      )}
    </div>
  );
}
