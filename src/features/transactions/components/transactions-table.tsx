"use client";

import { DateText } from "@/components/ui/date-text";
import { MoneyText } from "@/components/ui/money-text";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPaymentMethod } from "@/lib/format/payment-method";
import { formatPlate } from "@/lib/format/plate";
import { cn } from "@/lib/utils";

import type { Transaction } from "../schemas/transaction.schema";

import { StatusTags } from "./status-tags";

/**
 * Transactions with every column from the prototype. A click anywhere on a row opens its receipt;
 * the reference is also a button so keyboards can open it.
 */
export function TransactionsTable({
  transactions,
  onOpen,
  busy = false,
}: {
  transactions: readonly Transaction[];
  onOpen: (transaction: Transaction) => void;
  /** Dims the rows while new results load. */
  busy?: boolean;
}) {
  return (
    <TableContainer className={cn("transition-opacity", busy && "opacity-60")} label="Transactions">
      <Table aria-busy={busy || undefined}>
        <TableHeader>
          <tr>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Cashier</TableHead>
            <TableHead numeric>Amount</TableHead>
            <TableHead>Status</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow interactive key={transaction.id} onClick={() => onOpen(transaction)}>
              <TableCell className="text-[13px] whitespace-nowrap text-neutral-700 tabular-nums">
                <button
                  aria-label={`Open receipt ${transaction.reference}`}
                  className="text-left hover:text-text hover:underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(transaction);
                  }}
                  type="button"
                >
                  {transaction.reference}
                </button>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <DateText format="when" value={transaction.createdAt} />
              </TableCell>
              <TableCell>{transaction.service.name}</TableCell>
              <TableCell className="whitespace-nowrap">
                {formatPlate(transaction.vehicle.plate)}
              </TableCell>
              <TableCell>{formatPaymentMethod(transaction.method)}</TableCell>
              <TableCell className="whitespace-nowrap">{transaction.recordedBy.name}</TableCell>
              <TableCell className="font-medium" numeric>
                <MoneyText
                  kobo={transaction.amountKobo}
                  struck={transaction.status === "cancelled"}
                />
              </TableCell>
              <TableCell>
                <StatusTags transaction={transaction} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
