import { describe, expect, it } from "vitest";

import {
  adjustedTransaction,
  businessSettings,
  cancelledTransaction,
  paidTransaction,
} from "@/testing/fixtures";

import { newIdempotencyKey } from "./idempotency-key";
import { receiptLines, receiptText } from "./receipt";

describe("receipt", () => {
  it("formats the receipt's lines", () => {
    expect(receiptLines(paidTransaction)).toMatchObject({
      reference: "CW-261019-024",
      dateTime: "19 Oct 2026, 10:30 AM",
      listPrice: "₦6,000",
      adjustment: null,
      vehicle: "Toyota Corolla · KJA 482 FX",
      method: "Bank transfer",
      cashier: "Tunde Bello",
      total: "₦6,000",
      cancelled: false,
    });
  });

  it("shows the adjustment with its signed difference", () => {
    expect(receiptLines(adjustedTransaction).adjustment).toEqual({
      reason: "Regular customer discount",
      difference: "−₦500",
    });
  });

  it("says Not recorded when there is no vehicle, and marks cancellations", () => {
    const lines = receiptLines({
      ...cancelledTransaction,
      vehicle: { plate: null, makeModel: null },
    });
    expect(lines.vehicle).toBe("Not recorded");
    expect(lines.cancelled).toBe(true);
  });

  it("copies the prototype's text format", () => {
    expect(receiptText(paidTransaction, businessSettings)).toBe(
      [
        "Cartory Wash",
        "CW-261019-024 · 19 Oct 2026, 10:30 AM",
        "Full wash: ₦6,000",
        "Paid by Bank transfer",
        "Cashier: Tunde Bello",
        "Clean car. Clear impression.",
      ].join("\n"),
    );
  });
});

describe("newIdempotencyKey", () => {
  it("returns a fresh v4 UUID each time", () => {
    const first = newIdempotencyKey();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(newIdempotencyKey()).not.toBe(first);
  });
});
