import { cn } from "@/lib/utils";

import type { HeroFrame } from "../../utils/hero-frame";
import { MOCK_KICKER } from "../landing-classes";

/** The desk's summary column: services, method, the transfer check, total and Save. */
export function HeroDeskSummary({ frame }: { frame: HeroFrame }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5 border-l border-divider pl-3.5">
      <span className={MOCK_KICKER}>Summary</span>
      <div className="flex justify-between border-b border-divider pb-1.5 text-[11px]">
        <span className="text-neutral-700">Services</span>
        <span>{frame.summaryServices}</span>
      </div>
      <div className="flex justify-between border-b border-divider pb-1.5 text-[11px]">
        <span className="text-neutral-700">Method</span>
        <span>{frame.summaryMethod}</span>
      </div>
      <div
        className={cn(
          "flex items-start gap-1.5 border border-accent-300 bg-accent-100 p-[7px] text-[10px] leading-[1.3] text-accent-900 transition-all duration-350 ease-(--cw-ease)",
          !frame.confirmShown && "translate-y-1.5 opacity-0",
        )}
      >
        <span
          className={cn(
            "size-3 flex-none border border-accent transition-colors duration-200",
            frame.confirmTicked && "bg-accent",
          )}
        />
        <span>Transfer has arrived in the bank app.</span>
      </div>
      <div className="mt-auto flex items-end justify-between">
        <span className="text-[9px] tracking-[0.1em] text-accent uppercase">Total</span>
        <span className="font-heading text-[30px] leading-none font-semibold">{frame.total}</span>
      </div>
      <div
        className={cn(
          "p-2.5 text-center text-[13px] font-semibold text-bg transition-all duration-200 ease-in-out",
          frame.savePressed ? "scale-96 bg-accent-600 ring-4 ring-accent/35" : "bg-accent",
        )}
      >
        03 Save &amp; show receipt
      </div>
    </div>
  );
}
