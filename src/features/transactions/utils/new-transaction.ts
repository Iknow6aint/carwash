import { ApiError } from "@/lib/api/api-error";
import { formatNaira, nairaToKobo } from "@/lib/format/money";
import type { PaymentMethod } from "@/lib/format/payment-method";
import { normalizePlate } from "@/lib/format/plate";

import type { CreateTransactionInput } from "../schemas/transaction.schema";

/**
 * The New transaction form's rules, as pure functions. Copy is the prototype's, word for word;
 * the API applies the same rules (transactions.md) and its error codes map to the same copy.
 */

export interface NewTransactionForm {
  serviceId: string | null;
  plate: string;
  makeModel: string;
  method: PaymentMethod | null;
  /** "Adjust price" is ticked. */
  adjust: boolean;
  /** "Amount charged (₦)" as typed. */
  amount: string;
  reason: string;
  /** The transfer / POS confirmation is ticked. */
  confirmed: boolean;
}

export const BLANK_NEW_TRANSACTION: NewTransactionForm = {
  serviceId: null,
  plate: "",
  makeModel: "",
  method: null,
  adjust: false,
  amount: "",
  reason: "",
  confirmed: false,
};

export const MESSAGES = {
  service: "Choose a service.",
  method: "Choose how the customer paid.",
  amount: "Enter the amount charged.",
  amountTooHigh: "Enter an amount up to ₦1,000,000.",
  reason: "Give a reason for the price change.",
  transfer: "Confirm the transfer has arrived.",
  pos: "Confirm the POS slip shows approved.",
  offline: "Couldn't reach the server. Try again; the sale won't be saved twice.",
} as const;

/** Prices top out at ₦1,000,000 (100,000,000 kobo, transactions.md). */
const MAX_AMOUNT_NAIRA = 1_000_000;

/** The confirmation tick's copy (style guide). */
export function confirmationCopy(method: PaymentMethod): string {
  return method === "pos"
    ? "The POS terminal printed an approved slip for this amount."
    : "I checked the bank app and this transfer has arrived.";
}

/** Transfers and POS need the tick when the business setting is on (cash never does). */
export function needsConfirmation(
  method: PaymentMethod | null,
  requirePaymentConfirmation: boolean,
): boolean {
  return requirePaymentConfirmation && method !== null && method !== "cash";
}

function confirmationError(method: PaymentMethod): string {
  return method === "pos" ? MESSAGES.pos : MESSAGES.transfer;
}

/**
 * The adjusted amount in whole naira, read the prototype's forgiving way: anything but digits and
 * a point is ignored, then rounded ("₦2,500" → 2500). 0 when nothing usable was typed.
 */
function parseAmountCharged(amount: string): number {
  const value = Math.round(Number(amount.replace(/[^0-9.]/g, "")));
  return Number.isFinite(value) ? value : 0;
}

/** The summary panel's figures. */
export function summarise(form: NewTransactionForm, listPriceKobo: number | null) {
  const adjustedNaira = parseAmountCharged(form.amount);
  const totalKobo = form.adjust ? nairaToKobo(adjustedNaira) : (listPriceKobo ?? 0);
  const differenceKobo =
    listPriceKobo !== null && form.adjust && adjustedNaira ? totalKobo - listPriceKobo : 0;
  return {
    totalKobo,
    /** "₦500 below list price" / "₦1,000 above list price", or null. */
    adjustmentNote: differenceKobo
      ? `${formatNaira(Math.abs(differenceKobo))} ${differenceKobo < 0 ? "below" : "above"} list price`
      : null,
  };
}

export type ValidationResult =
  { ok: true; input: CreateTransactionInput } | { ok: false; errors: string[] };

/**
 * Checks the form the way the prototype does, in the same order, and builds the request body.
 *
 * @param form - Current form state.
 * @param context - The chosen service's list price and the `requirePaymentConfirmation` setting.
 */
export function validateNewTransaction(
  form: NewTransactionForm,
  context: { listPriceKobo: number | null; requirePaymentConfirmation: boolean },
): ValidationResult {
  const errors: string[] = [];
  if (!form.serviceId || context.listPriceKobo === null) errors.push(MESSAGES.service);
  if (!form.method) errors.push(MESSAGES.method);

  const amountNaira = parseAmountCharged(form.amount);
  if (form.adjust) {
    if (!amountNaira || amountNaira <= 0) errors.push(MESSAGES.amount);
    else if (amountNaira > MAX_AMOUNT_NAIRA) errors.push(MESSAGES.amountTooHigh);
    if (!form.reason.trim()) errors.push(MESSAGES.reason);
  }
  if (
    form.method &&
    needsConfirmation(form.method, context.requirePaymentConfirmation) &&
    !form.confirmed
  ) {
    errors.push(confirmationError(form.method));
  }
  if (errors.length || !form.serviceId || !form.method) return { ok: false, errors };

  const makeModel = form.makeModel.trim();
  return {
    ok: true,
    input: {
      serviceId: form.serviceId,
      method: form.method,
      plate: normalizePlate(form.plate),
      makeModel: makeModel || null,
      ...(form.adjust
        ? { amountKobo: nairaToKobo(amountNaira), adjustmentReason: form.reason.trim() }
        : {}),
      paymentConfirmed: form.method !== "cash" && form.confirmed,
    },
  };
}

/**
 * The copy to show for a failed save. Known API error codes map to the prototype's messages; a
 * sale that never reached the server says it is safe to retry (the idempotency key is reused).
 */
export function saveErrorMessage(error: unknown, method: PaymentMethod | null): string {
  if (!(error instanceof ApiError)) return MESSAGES.offline;
  switch (error.code) {
    case "ADJUSTMENT_REASON_REQUIRED":
      return MESSAGES.reason;
    case "INVALID_AMOUNT":
      return MESSAGES.amount;
    case "PAYMENT_NOT_CONFIRMED":
      return method ? confirmationError(method) : error.message;
    default:
      break;
  }
  if (error.kind === "network" || error.kind === "timeout") return MESSAGES.offline;
  return error.message;
}
