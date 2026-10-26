import { describe, expect, it } from "vitest";

import {
  adjustedTransaction,
  cancelledTransaction,
  paidTransaction,
  transactionList,
} from "@/testing/fixtures";

import {
  cancelTransactionSchema,
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionListSchema,
  transactionSchema,
} from "./transaction.schema";

describe("transactionSchema", () => {
  it.each([
    ["paid", paidTransaction],
    ["adjusted", adjustedTransaction],
    ["cancelled", cancelledTransaction],
  ])("parses a %s transaction from the contract", (_, transaction) => {
    expect(transactionSchema.parse(transaction)).toEqual(transaction);
  });

  it("accepts a missing plate and make/model as null", () => {
    const parsed = transactionSchema.parse({
      ...paidTransaction,
      vehicle: { plate: null, makeModel: null },
    });
    expect(parsed.vehicle).toEqual({ plate: null, makeModel: null });
  });

  it("drops fields the contract does not define", () => {
    const parsed = transactionSchema.parse({ ...paidTransaction, _id: "x", __v: 0 });
    expect(parsed).not.toHaveProperty("_id");
  });

  it.each([
    ["a float amount", { amountKobo: 6000.5 }],
    ["an unknown method", { method: "card" }],
    ["an unknown status", { status: "deleted" }],
    ["a malformed reference", { reference: "TX-1" }],
    ["a non-ObjectId id", { id: "123" }],
    ["a missing cancellation key", { cancellation: undefined }],
    ["a local date-time", { createdAt: "19/10/2026 10:30" }],
    ["a business date with time", { businessDate: "2026-10-19T00:00:00Z" }],
  ])("rejects %s", (_, override) => {
    expect(transactionSchema.safeParse({ ...paidTransaction, ...override }).success).toBe(false);
  });
});

describe("transactionListSchema", () => {
  it("parses a page with its summary", () => {
    const parsed = transactionListSchema.parse(transactionList);
    expect(parsed.items).toHaveLength(3);
    expect(parsed.summary.paidTotalKobo).toBe(1_150_000);
    expect(parsed.pageInfo.totalPages).toBe(1);
  });

  it("rejects a page without a summary or pageInfo", () => {
    expect(
      transactionListSchema.safeParse({ ...transactionList, summary: undefined }).success,
    ).toBe(false);
    expect(
      transactionListSchema.safeParse({ ...transactionList, pageInfo: undefined }).success,
    ).toBe(false);
  });
});

describe("request schemas", () => {
  it("defaults the list query to today, page 1, 40 a page", () => {
    expect(listTransactionsQuerySchema.parse({})).toEqual({ range: "today", page: 1, limit: 40 });
    expect(listTransactionsQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("only accepts whole-naira amounts on a new transaction", () => {
    const base = { serviceId: paidTransaction.service.id, method: "cash" as const };
    expect(createTransactionSchema.safeParse({ ...base, amountKobo: 250_000 }).success).toBe(true);
    expect(createTransactionSchema.safeParse({ ...base, amountKobo: 250_050 }).success).toBe(false);
    expect(createTransactionSchema.safeParse({ ...base, amountKobo: 0 }).success).toBe(false);
  });

  it("requires a cancellation reason, in the prototype's words", () => {
    const result = cancelTransactionSchema.safeParse({ reason: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("A reason is required. It stays on the record.");
  });
});
