/**
 * Payment methods, always in this order: cash, transfer, POS (PROJECT_GUIDE §9). Charts, legends
 * and splits use this order and the matching data colours (cash yellow, transfer cyan, POS
 * orange). No abbreviations except POS.
 */
export const PAYMENT_METHODS = ["cash", "transfer", "pos"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  transfer: "Bank transfer",
  pos: "POS",
};

export function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}

/** Swatch classes from the data-colour tokens (`--color-cash` / `-transfer` / `-pos`). */
export const PAYMENT_METHOD_SWATCH: Record<PaymentMethod, string> = {
  cash: "bg-cash",
  transfer: "bg-transfer",
  pos: "bg-pos",
};
