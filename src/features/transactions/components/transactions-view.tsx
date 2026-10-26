"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table";
import { formatNaira } from "@/lib/format/money";
import { plural } from "@/lib/format/text";

import { useDebouncedValue } from "../hooks/use-debounced-value";
import { TRANSACTIONS_PAGE_SIZE, useTransactionList } from "../hooks/use-transactions";
import type { Transaction } from "../schemas/transaction.schema";
import {
  isUnfiltered,
  transactionFiltersToQuery,
  transactionFiltersToSearchParams,
  type TransactionFilters,
} from "../utils/transaction-filters";

import { ReceiptDialog } from "./receipt-dialog";
import { TransactionsFilters } from "./transactions-filters";
import { TransactionsTable } from "./transactions-table";

/** Debounce for the search box (PROJECT_GUIDE §8). */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Transactions: search, filters, the summary line, the table, "Show 40 more" and receipts.
 *
 * Filters live in the URL: the page reads them on load (`initialFilters`) and every change is
 * written back with `router.replace`, so a refresh or a shared link shows the same list.
 */
export function TransactionsView({ initialFilters }: { initialFilters: TransactionFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [choices, setChoices] = useState<Omit<TransactionFilters, "q">>({
    range: initialFilters.range,
    method: initialFilters.method,
    status: initialFilters.status,
  });
  const [search, setSearch] = useState(initialFilters.q);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const filters = useMemo<TransactionFilters>(
    () => ({ ...choices, q: debouncedSearch }),
    [choices, debouncedSearch],
  );
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  useEffect(() => {
    const next = transactionFiltersToSearchParams(filters).toString();
    if (next !== window.location.search.replace(/^\?/, "")) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [filters, pathname, router]);

  const list = useTransactionList(filters);
  const transactions = list.data?.pages.flatMap((page) => page.items) ?? [];
  const summary = list.data?.pages[0]?.summary;
  const exportParams = new URLSearchParams(
    Object.entries(transactionFiltersToQuery(filters)).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <TransactionsFilters
        exportHref={`/api/export/transactions?${exportParams.toString()}`}
        filters={filters}
        onFiltersChange={(patch) => setChoices((current) => ({ ...current, ...patch }))}
        onSearchChange={setSearch}
        search={search}
      />

      {list.isPending ? (
        <TableSkeleton columns={8} label="Loading transactions" />
      ) : list.isError && !list.data ? (
        <ErrorState
          error={list.error}
          onRetry={() => void list.refetch()}
          title="Transactions didn't load."
        />
      ) : (
        <>
          <p aria-live="polite" className="text-[13px] text-neutral-700">
            {summary
              ? `${plural(summary.count, "transaction")} · ${formatNaira(summary.paidTotalKobo)} paid`
              : null}
          </p>
          {transactions.length === 0 ? (
            isUnfiltered(filters) ? (
              <EmptyState
                description="Sales show here as soon as they're saved on New transaction."
                title="No transactions yet."
              />
            ) : (
              <EmptyState title="No transactions match these filters." />
            )
          ) : (
            <TransactionsTable
              busy={list.isPlaceholderData}
              onOpen={setReceipt}
              transactions={transactions}
            />
          )}
          {list.isFetchNextPageError ? (
            <ErrorState
              error={list.error}
              onRetry={() => void list.fetchNextPage()}
              title="More transactions didn't load."
            />
          ) : null}
          {list.hasNextPage ? (
            <Button
              className="self-center"
              loading={list.isFetchingNextPage}
              onClick={() => void list.fetchNextPage()}
              variant="secondary"
            >
              Show {TRANSACTIONS_PAGE_SIZE} more
            </Button>
          ) : null}
        </>
      )}

      <ReceiptDialog onClose={() => setReceipt(null)} transaction={receipt} />
    </div>
  );
}
