"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { unwrapServiceResult, unwrapServiceSuccess } from "@/lib/api/service-result";

import type { CreateTransactionInput, Transaction } from "../schemas/transaction.schema";
import {
  cancelTransaction,
  createTransaction,
  getTransaction,
  listTransactions,
} from "../services/transactions.service";
import { transactionFiltersToQuery, type TransactionFilters } from "../utils/transaction-filters";

/** "Show 40 more" pages through the list 40 at a time. */
export const TRANSACTIONS_PAGE_SIZE = 40;

/** The filtered list, page by page. The previous results stay on screen while filters change. */
export function useTransactionList(filters: TransactionFilters) {
  const query = transactionFiltersToQuery(filters);
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.list(query),
    queryFn: async ({ pageParam }) =>
      unwrapServiceResult(
        await listTransactions({ ...query, page: pageParam, limit: TRANSACTIONS_PAGE_SIZE }),
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pageInfo.page < last.pageInfo.totalPages ? last.pageInfo.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

/**
 * One transaction for the receipt. `seed` (a row from a list) shows the receipt at once and is
 * treated as stale, so `GET /transactions/:id` confirms it in the background. A sale just saved
 * or cancelled is already in the cache (see the mutations) and is not fetched again.
 */
export function useTransaction(id: string | null, seed?: Transaction) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id ?? ""),
    queryFn: async () => unwrapServiceResult(await getTransaction(id ?? "")),
    enabled: Boolean(id),
    ...(seed && seed.id === id ? { initialData: seed, initialDataUpdatedAt: 0 } : {}),
  });
}

/**
 * A sale or a cancellation changes the lists, the dashboard, reports, each service's
 * "Sold · 30 days" and each cashier's "Today" count.
 */
function invalidateAfterSale(client: QueryClient) {
  for (const queryKey of [
    queryKeys.transactions.all,
    queryKeys.dashboard.all,
    queryKeys.reports.all,
    queryKeys.services.all,
    queryKeys.staff.all,
  ]) {
    void client.invalidateQueries({ queryKey });
  }
}

export function useCreateTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { input: CreateTransactionInput; idempotencyKey: string }) =>
      unwrapServiceResult(await createTransaction(variables.input, variables.idempotencyKey)),
    onSuccess: (transaction) => {
      client.setQueryData(queryKeys.transactions.detail(transaction.id), transaction);
      invalidateAfterSale(client);
    },
  });
}

export function useCancelTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string; reason: string }) =>
      unwrapServiceSuccess(await cancelTransaction(variables.id, variables.reason)),
    onSuccess: ({ data }) => {
      client.setQueryData(queryKeys.transactions.detail(data.id), data);
      invalidateAfterSale(client);
    },
  });
}
