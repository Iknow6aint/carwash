"use client";

import { ArrowRightLeft, Banknote, CreditCard, type LucideIcon } from "lucide-react";

import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/format/payment-method";
import { cn } from "@/lib/utils";

const ICONS: Record<PaymentMethod, LucideIcon> = {
  cash: Banknote,
  transfer: ArrowRightLeft,
  pos: CreditCard,
};

/** Step 03: Cash / Bank transfer / POS. Payment-method colours never go on buttons. */
export function MethodTiles({
  value,
  onSelect,
  labelledBy,
}: {
  value: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  labelledBy: string;
}) {
  return (
    <div
      aria-labelledby={labelledBy}
      className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5"
      role="group"
    >
      {PAYMENT_METHODS.map((method) => {
        const Icon = ICONS[method];
        const selected = method === value;
        return (
          <button
            aria-pressed={selected}
            className={cn(
              "flex min-h-14 items-center gap-2.5 border px-4 py-3.5 text-[15px] font-medium text-text transition-colors hover:border-accent",
              selected ? "border-accent bg-accent-100" : "border-divider bg-transparent",
            )}
            key={method}
            onClick={() => onSelect(method)}
            type="button"
          >
            <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
            {PAYMENT_METHOD_LABELS[method]}
          </button>
        );
      })}
    </div>
  );
}
