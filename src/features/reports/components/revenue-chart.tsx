"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { MoneyText } from "@/components/ui/money-text";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDayLabel } from "@/lib/format/date";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_SWATCH,
  PAYMENT_METHODS,
} from "@/lib/format/payment-method";
import { cn } from "@/lib/utils";

import type { Report } from "../schemas/report.schema";
import { chartBars, peakText, rangeText } from "../utils/chart";

/**
 * "Revenue by day": a hand-built stacked bar per day, cash at the bottom, then bank transfer, then
 * POS, scaled to the busiest day. Each bar has a native tooltip; the same numbers are available as
 * a table for screen readers and anyone who wants exact figures.
 */
export function RevenueChart({ report }: { report: Report }) {
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();
  const bars = chartBars(report.days);
  const summary = `Revenue by day, ${rangeText(report.from, report.to, report.dayCount)}${
    report.peakDay ? `. Peak ${peakText(report.peakDay)}` : ". No paid transactions"
  }.`;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
        <h3>Revenue by day</h3>
        <ul aria-label="Legend" className="flex flex-wrap items-center gap-3.5">
          {PAYMENT_METHODS.map((method) => (
            <li className="flex items-center gap-1.5 text-[12px]" key={method}>
              <span aria-hidden="true" className={cn("size-2.5", PAYMENT_METHOD_SWATCH[method])} />
              {PAYMENT_METHOD_LABELS[method]}
            </li>
          ))}
        </ul>
        {report.peakDay ? (
          <span className="ml-auto text-[12px] text-neutral-700">
            Peak {peakText(report.peakDay)}
          </span>
        ) : null}
      </div>

      <div
        aria-label={summary}
        className="flex h-[200px] items-end gap-[3px] border-b border-text pt-2"
        role="img"
      >
        {bars.map((bar) => (
          <div
            className="flex h-full min-w-0 flex-[1_1_0] flex-col justify-end transition-opacity hover:opacity-75"
            key={bar.date}
            title={bar.title}
          >
            <div className="bg-pos" style={{ height: `${bar.pos}%` }} />
            <div className="bg-transfer" style={{ height: `${bar.transfer}%` }} />
            <div className="bg-cash" style={{ height: `${bar.cash}%` }} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="flex gap-[3px]">
        {bars.map((bar) => (
          <div
            className="min-w-0 flex-[1_1_0] text-center text-[11px] text-neutral-700 tabular-nums"
            key={bar.date}
          >
            {bar.tick}
          </div>
        ))}
      </div>

      <Button
        aria-controls={tableId}
        aria-expanded={showTable}
        className="self-start"
        onClick={() => setShowTable((shown) => !shown)}
        size="sm"
        variant="ghost"
      >
        {showTable ? "Hide chart data" : "Show chart data"}
      </Button>
      <div hidden={!showTable} id={tableId}>
        <TableContainer label="Revenue by day, as a table">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Date</TableHead>
                <TableHead numeric>Cash</TableHead>
                <TableHead numeric>Bank transfer</TableHead>
                <TableHead numeric>POS</TableHead>
                <TableHead numeric>Total</TableHead>
                <TableHead numeric>Cars</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {report.days.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="whitespace-nowrap">{formatDayLabel(day.date)}</TableCell>
                  <TableCell numeric>
                    <MoneyText kobo={day.cashKobo} />
                  </TableCell>
                  <TableCell numeric>
                    <MoneyText kobo={day.transferKobo} />
                  </TableCell>
                  <TableCell numeric>
                    <MoneyText kobo={day.posKobo} />
                  </TableCell>
                  <TableCell className="font-medium" numeric>
                    <MoneyText kobo={day.totalKobo} />
                  </TableCell>
                  <TableCell numeric>{day.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </section>
  );
}
