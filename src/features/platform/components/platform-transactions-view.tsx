"use client";

import { useState } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Seg, type SegOption } from "@/components/ui/seg";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { useDebouncedValue } from "@/features/transactions/hooks/use-debounced-value";
import { formatShortDate } from "@/lib/format/date";
import { formatNaira } from "@/lib/format/money";
import { formatPaymentMethod, PAYMENT_METHODS } from "@/lib/format/payment-method";

import { usePlatformTransactions } from "../hooks/use-platform";
import { PLATFORM_TRANSACTION_STATUSES } from "../schemas/platform.schema";

type StatusFilter = (typeof PLATFORM_TRANSACTION_STATUSES)[number];
type MethodFilter = "all" | "cash" | "transfer" | "pos";

const STATUS_OPTIONS: ReadonlyArray<SegOption<StatusFilter>> = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 40;

/** Every business's transaction metadata: reference, business, amount, fee, method, status. */
export function PlatformTransactionsView() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [method, setMethod] = useState<MethodFilter>("all");
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const transactions = usePlatformTransactions({ status, method, q, page, limit: PAGE_SIZE });
  const pageInfo = transactions.data?.pageInfo;

  return (
    <section aria-label="Platform transactions" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Input
          aria-label="Search transactions"
          className="w-auto min-w-0 flex-[1_1_260px]"
          maxLength={60}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search reference or business"
          type="search"
          value={search}
        />
        <Seg
          label="Status"
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          value={status}
        />
        <Select
          aria-label="Payment method"
          onChange={(event) => {
            setMethod(event.target.value as MethodFilter);
            setPage(1);
          }}
          value={method}
          wrapperClassName="w-auto"
        >
          <option value="all">All methods</option>
          {PAYMENT_METHODS.map((value) => (
            <option key={value} value={value}>
              {formatPaymentMethod(value)}
            </option>
          ))}
        </Select>
      </div>

      {transactions.isPending ? (
        <TableSkeleton columns={8} label="Loading transactions" />
      ) : transactions.isError && !transactions.data ? (
        <ErrorState
          error={transactions.error}
          onRetry={() => void transactions.refetch()}
          title="Transactions didn't load."
        />
      ) : (
        <>
          <p aria-live="polite" className="text-[13px] text-neutral-700">
            {pageInfo ? `${pageInfo.total} transactions` : null}
          </p>
          <TableContainer label="Platform transactions">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Reference</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead numeric>Amount</TableHead>
                  <TableHead numeric>Fee</TableHead>
                  <TableHead>Status</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {transactions.data?.items.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-[12px] whitespace-nowrap">
                      {transaction.reference}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{transaction.business.name}</TableCell>
                    <TableCell className="whitespace-nowrap text-neutral-700">
                      {formatShortDate(new Date(transaction.createdAt))}
                    </TableCell>
                    <TableCell>{formatPaymentMethod(transaction.method)}</TableCell>
                    <TableCell className="whitespace-nowrap">{transaction.recordedBy}</TableCell>
                    <TableCell numeric>{formatNaira(transaction.amountKobo)}</TableCell>
                    <TableCell numeric>{formatNaira(transaction.feeKobo)}</TableCell>
                    <TableCell>
                      <Tag tone={transaction.status === "paid" ? "accent" : "neutral"}>
                        {transaction.status === "paid" ? "Paid" : "Cancelled"}
                      </Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {transactions.data?.items.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-neutral-700">
              No transactions match these filters.
            </p>
          ) : null}
          {pageInfo && pageInfo.totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <Button
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                variant="secondary"
              >
                Previous
              </Button>
              <span className="text-[13px] text-neutral-700">
                Page {pageInfo.page} of {pageInfo.totalPages}
              </span>
              <Button
                disabled={page >= pageInfo.totalPages}
                onClick={() => setPage((current) => current + 1)}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
