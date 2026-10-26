import { formatNaira } from "@/lib/format/money";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_SWATCH,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/format/payment-method";
import { formatShare } from "@/lib/format/text";
import { cn } from "@/lib/utils";

export interface MethodShare {
  method: PaymentMethod;
  totalKobo: number;
  /** 0–1 of revenue. */
  share: number;
}

/**
 * The payment-method split: a stacked bar plus a legend with each method's share and naira value.
 * Always cash → transfer → POS in yellow / cyan / orange, whatever order the data arrives in
 * (PROJECT_GUIDE §9).
 */
export function MethodSplitBar({
  methods,
  className,
}: {
  methods: readonly MethodShare[];
  className?: string;
}) {
  const ordered = PAYMENT_METHODS.map(
    (method) =>
      methods.find((entry) => entry.method === method) ?? { method, totalKobo: 0, share: 0 },
  );
  const summary = ordered
    .map((entry) => `${PAYMENT_METHOD_LABELS[entry.method]} ${formatShare(entry.share)}`)
    .join(", ");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        aria-label={`Split by payment method: ${summary}`}
        className="flex h-2.5 bg-neutral-200"
        role="img"
      >
        {ordered.map((entry) => (
          <div
            className={PAYMENT_METHOD_SWATCH[entry.method]}
            key={entry.method}
            style={{ width: `${Math.max(0, Math.min(1, entry.share)) * 100}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {ordered.map((entry) => (
          <li className="flex items-center gap-2 text-[14px]" key={entry.method}>
            <span
              aria-hidden="true"
              className={cn("size-2.5 flex-none", PAYMENT_METHOD_SWATCH[entry.method])}
            />
            <span className="flex-1">{PAYMENT_METHOD_LABELS[entry.method]}</span>
            <span className="text-[12px] text-neutral-700 tabular-nums">
              {formatShare(entry.share)}
            </span>
            <span className="min-w-[84px] text-right font-medium tabular-nums">
              {formatNaira(entry.totalKobo)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
