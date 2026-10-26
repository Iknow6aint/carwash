"use server";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES, withQuery } from "@/lib/api/endpoints";
import { idSchema } from "@/lib/api/schema-helpers";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  cancelTransactionSchema,
  createTransactionSchema,
  idempotencyKeySchema,
  listTransactionsQuerySchema,
  transactionListSchema,
  transactionSchema,
  type CreateTransactionInput,
  type ListTransactionsQuery,
  type Transaction,
  type TransactionList,
} from "../schemas/transaction.schema";

/** Transactions (transactions.md). Any role records and reads; only admins cancel. */

/** One page of transactions, newest first, with the summary of everything matching. */
export async function listTransactions(
  query: ListTransactionsQuery,
): Promise<ServiceResult<TransactionList>> {
  return executeBackendService(async () => {
    const params = listTransactionsQuerySchema.parse(query);
    return mapBackendData(
      authenticatedBackendRequest(withQuery(API_ROUTES.transactions.list, params)),
      (data) => transactionListSchema.parse(data),
    );
  });
}

/** One transaction (receipt data). */
export async function getTransaction(id: string): Promise<ServiceResult<Transaction>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(API_ROUTES.transactions.detail(idSchema.parse(id))),
      (data) => transactionSchema.parse(data),
    ),
  );
}

/**
 * Records a sale. `idempotencyKey` is created once per New transaction form session and reused on
 * every retry, so a flaky connection can never save the same sale twice: the API answers a
 * repeated key with the original transaction.
 */
export async function createTransaction(
  input: CreateTransactionInput,
  idempotencyKey: string,
): Promise<ServiceResult<Transaction>> {
  return executeBackendService(async () => {
    const body = createTransactionSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.transactions.list, {
        method: "POST",
        body,
        idempotencyKey: idempotencyKeySchema.parse(idempotencyKey),
      }),
      (data) => transactionSchema.parse(data),
    );
  });
}

/** Cancels a paid transaction with a reason (admin). It stays in history, out of every total. */
export async function cancelTransaction(
  id: string,
  reason: string,
): Promise<ServiceResult<Transaction>> {
  return executeBackendService(async () => {
    const body = cancelTransactionSchema.parse({ reason });
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.transactions.cancel(idSchema.parse(id)), {
        method: "POST",
        body,
      }),
      (data) => transactionSchema.parse(data),
    );
  });
}
