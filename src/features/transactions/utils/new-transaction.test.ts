import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { FULL_WASH_ID } from "@/testing/fixtures";

import {
  BLANK_NEW_TRANSACTION,
  MESSAGES,
  needsConfirmation,
  saveErrorMessage,
  summarise,
  validateNewTransaction,
  type NewTransactionForm,
} from "./new-transaction";

const LIST_PRICE = 600_000;
const context = { listPriceKobo: LIST_PRICE, requirePaymentConfirmation: true };
const ready: NewTransactionForm = {
  ...BLANK_NEW_TRANSACTION,
  serviceId: FULL_WASH_ID,
  method: "cash",
};

describe("validateNewTransaction", () => {
  it("lists what is missing, in the prototype's order and words", () => {
    const result = validateNewTransaction(BLANK_NEW_TRANSACTION, {
      listPriceKobo: null,
      requirePaymentConfirmation: true,
    });
    expect(result).toEqual({
      ok: false,
      errors: ["Choose a service.", "Choose how the customer paid."],
    });
  });

  it("charges the list price when nothing is adjusted (three taps)", () => {
    expect(
      validateNewTransaction({ ...ready, plate: " kja  482 fx ", makeModel: " " }, context),
    ).toEqual({
      ok: true,
      input: {
        serviceId: FULL_WASH_ID,
        method: "cash",
        plate: "KJA 482 FX",
        makeModel: null,
        paymentConfirmed: false,
      },
    });
  });

  it("needs an amount and a reason when the price is adjusted", () => {
    expect(validateNewTransaction({ ...ready, adjust: true }, context)).toEqual({
      ok: false,
      errors: [MESSAGES.amount, MESSAGES.reason],
    });
    expect(
      validateNewTransaction(
        { ...ready, adjust: true, amount: "₦5,500", reason: " Regular " },
        context,
      ),
    ).toEqual({
      ok: true,
      input: expect.objectContaining({ amountKobo: 550_000, adjustmentReason: "Regular" }),
    });
  });

  it("asks transfer and POS for their own confirmation, never cash", () => {
    expect(validateNewTransaction({ ...ready, method: "transfer" }, context)).toEqual({
      ok: false,
      errors: ["Confirm the transfer has arrived."],
    });
    expect(validateNewTransaction({ ...ready, method: "pos" }, context)).toEqual({
      ok: false,
      errors: ["Confirm the POS slip shows approved."],
    });
    expect(
      validateNewTransaction({ ...ready, method: "pos", confirmed: true }, context),
    ).toMatchObject({
      ok: true,
      input: { paymentConfirmed: true },
    });
    expect(
      validateNewTransaction(
        { ...ready, method: "transfer" },
        { ...context, requirePaymentConfirmation: false },
      ).ok,
    ).toBe(true);
  });

  it("knows when the tick is needed", () => {
    expect(needsConfirmation("cash", true)).toBe(false);
    expect(needsConfirmation("transfer", true)).toBe(true);
    expect(needsConfirmation("pos", false)).toBe(false);
    expect(needsConfirmation(null, true)).toBe(false);
  });
});

describe("summarise", () => {
  it("shows the list price, or the adjusted amount with its difference", () => {
    expect(summarise(ready, LIST_PRICE)).toEqual({ totalKobo: LIST_PRICE, adjustmentNote: null });
    expect(summarise({ ...ready, adjust: true, amount: "5500" }, LIST_PRICE)).toEqual({
      totalKobo: 550_000,
      adjustmentNote: "₦500 below list price",
    });
    expect(summarise({ ...ready, adjust: true, amount: "7000" }, LIST_PRICE).adjustmentNote).toBe(
      "₦1,000 above list price",
    );
    expect(summarise(BLANK_NEW_TRANSACTION, null).totalKobo).toBe(0);
  });
});

describe("saveErrorMessage", () => {
  it("maps API error codes to the prototype's copy", () => {
    const error = (code: string, message = "server copy") =>
      new ApiError(message, 400, "validation", undefined, code);
    expect(saveErrorMessage(error("ADJUSTMENT_REASON_REQUIRED"), "cash")).toBe(
      "Give a reason for the price change.",
    );
    expect(saveErrorMessage(error("INVALID_AMOUNT"), "cash")).toBe("Enter the amount charged.");
    expect(saveErrorMessage(error("PAYMENT_NOT_CONFIRMED"), "pos")).toBe(
      "Confirm the POS slip shows approved.",
    );
    expect(saveErrorMessage(error("PAYMENT_NOT_CONFIRMED"), "transfer")).toBe(
      "Confirm the transfer has arrived.",
    );
    expect(
      saveErrorMessage(
        error("SERVICE_INACTIVE", "This service is no longer offered. Choose another."),
        "cash",
      ),
    ).toBe("This service is no longer offered. Choose another.");
  });

  it("says a retry is safe when the server was never reached", () => {
    expect(saveErrorMessage(new ApiError("x", 0, "network"), "cash")).toBe(MESSAGES.offline);
  });
});
