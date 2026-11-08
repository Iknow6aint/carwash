import { Tag, type TagTone } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import { MOCK_METHOD_SWATCH, TOUR_TRANSACTIONS, type MockStatus } from "../../utils/demo-data";
import { fadeRise } from "../fade-rise";

const COLUMNS = "grid grid-cols-[1.1fr_1.2fr_1fr_0.9fr_0.9fr_0.8fr] gap-2";

const STATUS_TONE: Record<MockStatus, TagTone> = {
  Paid: "accent",
  Adjusted: "outline",
  Cancelled: "neutral",
};

/** Tour 3: today's transactions; the cancelled one stays, struck through. */
export function TourTransactionsPanel({ shown }: { shown: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <div className="flex-[1_1_200px] border border-divider px-2.5 py-[7px] text-[12px] text-neutral-600">
          Search plate, reference, service or cashier
        </div>
        <div className="flex border border-divider text-[12px]">
          <span className="bg-accent-100 px-2.5 py-[7px] text-accent-800">Today</span>
          <span className="px-2.5 py-[7px]">7 days</span>
          <span className="px-2.5 py-[7px]">30 days</span>
        </div>
      </div>
      {/* Six columns don't fit a phone: the table keeps its width and scrolls inside the window. */}
      <div className="overflow-x-auto">
        <div className="flex min-w-[520px] flex-col">
          <div
            className={cn(
              COLUMNS,
              "border-b border-divider py-1.5 text-[10px] tracking-[0.08em] text-neutral-700 uppercase",
            )}
          >
            <span>Time</span>
            <span>Service</span>
            <span>Vehicle</span>
            <span>Method</span>
            <span className="text-right">Amount</span>
            <span>Status</span>
          </div>
          {TOUR_TRANSACTIONS.map((row, index) => {
            const motion = fadeRise(shown, { delayMs: index * 70 });
            return (
              <div
                className={cn(
                  motion.className,
                  COLUMNS,
                  "items-center border-b border-divider py-[9px] text-[12px]",
                )}
                key={`${row.time}-${row.plate}`}
                style={motion.style}
              >
                <span className="text-neutral-700">{row.time}</span>
                <span>{row.service}</span>
                <span>{row.plate}</span>
                <span className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 flex-none", MOCK_METHOD_SWATCH[row.method])} />
                  {row.method}
                </span>
                <span
                  className={cn(
                    "text-right font-medium",
                    row.status === "Cancelled" && "line-through",
                  )}
                >
                  {row.amount}
                </span>
                <span>
                  <Tag tone={STATUS_TONE[row.status]}>{row.status}</Tag>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
