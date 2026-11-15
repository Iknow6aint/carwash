"use client";

import { ArrowRightLeft, CreditCard, type LucideIcon } from "lucide-react";

import {
  PAYMENT_METHOD_LABELS,
  SELECTABLE_PAYMENT_METHODS,
  type SelectablePaymentMethod,
} from "@/lib/format/payment-method";
import { cn } from "@/lib/utils";

const ICONS: Record<SelectablePaymentMethod, LucideIcon> = {
  transfer: ArrowRightLeft,
  pos: CreditCard,
};

/** Step 03: Bank transfer / POS. Cash is no longer offered for new sales. */
export function MethodTiles({
  value,
  onSelect,
  labelledBy,
}: {
  value: SelectablePaymentMethod | null;
  onSelect: (method: SelectablePaymentMethod) => void;
  labelledBy: string;
}) {
  return (
    <div
      aria-labelledby={labelledBy}
      className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5"
      role="group"
    >
      {SELECTABLE_PAYMENT_METHODS.map((method) => {
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
