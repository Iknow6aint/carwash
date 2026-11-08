import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

import { MOCK_KICKER } from "../landing-classes";
import styles from "../landing.module.css";

const CHIP = "border border-accent bg-accent-100 px-2.5 py-1.5 text-[12px]";

/** Step 3, web: the cashier searches "eng", adds Engine wash and the total updates. */
export function WebSalePanel({ shown }: { shown: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-heading text-[18px] font-semibold">New transaction</p>
      <div className="relative">
        <div className="flex items-center gap-1.5 border border-accent px-2.5 py-2 text-[13px]">
          <Search className="size-[13px] flex-none" strokeWidth={1.5} />
          {shown ? "eng" : ""}
          <span className={cn(styles.caret, "h-3.5 w-px bg-accent")} />
        </div>
        <div
          className={cn(
            "border border-t-0 border-divider bg-neutral-100 transition-opacity duration-300",
            shown ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="flex justify-between bg-accent-100 px-2.5 py-2 text-[12px]">
            <span>Engine wash</span>
            <span>₦5,000 +</span>
          </div>
          <div className="flex justify-between px-2.5 py-2 text-[12px] text-neutral-700">
            <span>Engine bay detail</span>
            <span>₦8,000 +</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className={CHIP}>Full wash · ₦6,000 ×</span>
        <span
          className={cn(
            CHIP,
            "transition-all delay-900 duration-450 ease-(--cw-pop)",
            !shown && "scale-60 opacity-0",
          )}
        >
          Engine wash · ₦5,000 ×
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-center text-[12px]">
        <span className="border border-accent bg-accent-100 p-2">Transfer</span>
        <span className="border border-divider p-2">POS</span>
      </div>
      <div className="flex items-end justify-between border-t border-divider pt-2">
        <span className={MOCK_KICKER}>Total · 2 services</span>
        <span className="font-heading text-[38px] leading-none font-semibold">
          {shown ? "₦11,000" : "₦6,000"}
        </span>
      </div>
      <div className="bg-accent p-[11px] text-center text-[13px] font-semibold text-bg">
        Save &amp; show receipt
      </div>
    </div>
  );
}
