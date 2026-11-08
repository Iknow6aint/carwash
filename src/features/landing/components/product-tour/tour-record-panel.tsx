import { cn } from "@/lib/utils";

import { EASE_OUT, fadeRise } from "../fade-rise";
import { MOCK_KICKER } from "../landing-classes";

const SUMMARY = [
  { label: "Service", value: "Full wash" },
  { label: "List price", value: "₦6,000" },
  { label: "Method", value: "POS" },
] as const;

/** Tour 2: a price adjusted with a reason and a POS slip confirmed before saving. */
export function TourRecordPanel({ shown }: { shown: boolean }) {
  const amount = fadeRise(shown, { fadeEase: EASE_OUT });
  const reason = fadeRise(shown, { delayMs: 170, fadeEase: EASE_OUT });
  const confirm = fadeRise(shown, { delayMs: 340, fadeEase: EASE_OUT });
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px]">
      <div className="flex flex-col gap-2.5">
        <p className={MOCK_KICKER}>Adjust price</p>
        <div className={cn(amount.className, "flex flex-col gap-1")} style={amount.style}>
          <p className="text-[11px] text-neutral-700">Amount charged (₦)</p>
          <div className="border border-accent px-2.5 py-2 text-[14px]">5,000</div>
        </div>
        <div className={cn(reason.className, "flex flex-col gap-1")} style={reason.style}>
          <p className="text-[11px] text-neutral-700">Reason (saved with the transaction)</p>
          <div className="border border-divider px-2.5 py-2 text-[14px]">
            Regular customer discount
          </div>
        </div>
        <div
          className={cn(
            confirm.className,
            "flex items-start gap-2 border border-accent-300 bg-accent-100 p-2.5 text-[12px] text-accent-900",
          )}
          style={confirm.style}
        >
          <span className="size-3 flex-none bg-accent" />
          The POS terminal printed an approved slip for this amount.
        </div>
      </div>
      <div className="flex flex-col gap-2 border-l border-divider pl-[18px]">
        {SUMMARY.map((row) => (
          <div
            className="flex justify-between border-b border-divider pb-1.5 text-[12px]"
            key={row.label}
          >
            <span className="text-neutral-700">{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
        <div className="mt-3 flex items-end justify-between">
          <span className={MOCK_KICKER}>Total</span>
          <span className="font-heading text-[44px] leading-none font-semibold">₦5,000</span>
        </div>
        <p className="text-right text-[11px] text-neutral-700">₦1,000 below list price</p>
        <div className="mt-1.5 bg-accent p-3 text-center text-[14px] font-semibold text-bg">
          Save &amp; show receipt
        </div>
      </div>
    </div>
  );
}
