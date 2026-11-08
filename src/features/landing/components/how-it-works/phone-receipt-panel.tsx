import { cn } from "@/lib/utils";

import { fadeRise } from "../fade-rise";

const LINES = [
  { label: "Full wash", value: "₦6,000", muted: false },
  { label: "Engine wash", value: "₦5,000", muted: false },
  { label: "Paid by", value: "Bank transfer", muted: true },
  { label: "Cashier", value: "Tunde Bello", muted: true },
] as const;

/** Step 3, phone: the receipt the customer gets. */
export function PhoneReceiptPanel({ shown }: { shown: boolean }) {
  const motion = fadeRise(shown, {
    delayMs: 1400,
    from: "translateY(20px)",
    fadeMs: 500,
    moveMs: 600,
  });
  return (
    <div
      className={cn(motion.className, "flex flex-col gap-2 border border-accent p-3")}
      style={motion.style}
    >
      <div className="border-b border-dashed border-neutral-500 pb-1.5 text-center">
        <p className="font-heading text-[16px] font-semibold">Splash Point Car Wash</p>
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
      <div className="flex items-end justify-between border-t border-dashed border-neutral-500 pt-1.5">
        <span className="text-[9px] tracking-[0.1em] text-accent uppercase">Total</span>
        <span className="font-heading text-[28px] leading-none font-semibold">₦11,000</span>
      </div>
      <p className="text-center text-[9px] text-neutral-700">Thank you for washing with us.</p>
    </div>
  );
}
