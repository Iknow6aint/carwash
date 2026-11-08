import { cn } from "@/lib/utils";

import { fadeRise } from "../fade-rise";

const LINES = [
  { label: "Full wash", value: "₦6,000", muted: false },
  { label: "Engine wash", value: "₦5,000", muted: false },
  { label: "Vehicle", value: "KJA 482 FX", muted: true },
  { label: "Paid by", value: "Bank transfer", muted: true },
] as const;

/** The receipt that slides over the desk once the sale is saved. */
export function HeroReceipt({ shown }: { shown: boolean }) {
  const motion = fadeRise(shown, {
    from: "translateY(18px) scale(0.98)",
    fadeMs: 450,
    moveMs: 600,
  });
  return (
    <div
      className={cn(
        motion.className,
        "absolute top-2.5 right-2.5 bottom-2.5 flex w-[min(56%,260px)] flex-col gap-[7px] border border-accent bg-bg p-3.5 shadow-lg",
      )}
      style={motion.style}
    >
      <div className="border-b border-dashed border-neutral-500 pb-1.5 text-center">
        <p className="font-heading text-[15px] font-semibold">Splash Point Car Wash</p>
        <p className="text-[9px] text-neutral-700">CW-261102-030 · 5:42 PM</p>
      </div>
      {LINES.map((line) => (
        <div
          className={cn(
            "flex justify-between",
            line.muted ? "text-[10px] text-neutral-700" : "text-[11px]",
          )}
          key={line.label}
        >
          <span>{line.label}</span>
          <span>{line.value}</span>
        </div>
      ))}
      <div className="mt-auto flex items-end justify-between border-t border-dashed border-neutral-500 pt-1.5">
        <span className="text-[9px] tracking-[0.1em] text-accent uppercase">Total</span>
        <span className="font-heading text-[26px] leading-none font-semibold">₦11,000</span>
      </div>
    </div>
  );
}
