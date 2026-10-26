import { formatReceiptDateTime } from "@/lib/format/date";
import { formatNaira, formatSignedNaira } from "@/lib/format/money";
import { formatPaymentMethod } from "@/lib/format/payment-method";

import type { Transaction } from "../schemas/transaction.schema";

/** Business details printed on a receipt (a subset of BusinessSettings). */
export interface ReceiptBusiness {
  name: string;
  address: string;
  phone: string;
  receiptFooter: string;
}

/** The receipt's lines, formatted (shared by the dialog, print and Copy text). */
export function receiptLines(transaction: Transaction) {
  const { vehicle } = transaction;
  return {
    reference: transaction.reference,
    dateTime: formatReceiptDateTime(transaction.createdAt),
    service: transaction.service.name,
    listPrice: formatNaira(transaction.listPriceKobo),
    /** "−₦500" when discounted, "+₦500" when charged above list. */
    adjustment: transaction.isAdjusted
      ? {
          reason: transaction.adjustmentReason ?? "",
          difference: formatSignedNaira(transaction.amountKobo - transaction.listPriceKobo),
        }
      : null,
    vehicle: [vehicle.makeModel, vehicle.plate].filter(Boolean).join(" · ") || "Not recorded",
    method: formatPaymentMethod(transaction.method),
    cashier: transaction.recordedBy.name,
    total: formatNaira(transaction.amountKobo),
    cancelled: transaction.status === "cancelled",
  };
}

/** The prototype's "Copy text" format, for pasting into WhatsApp or SMS. */
export function receiptText(transaction: Transaction, business: ReceiptBusiness): string {
  const lines = receiptLines(transaction);
  return [
    business.name,
    `${lines.reference} · ${lines.dateTime}`,
    `${lines.service}: ${lines.total}`,
    `Paid by ${lines.method}`,
    `Cashier: ${lines.cashier}`,
    business.receiptFooter,
  ]
    .filter((line) => line.trim() !== "")
    .join("\n");
}
