"use client";

import { MoneyText } from "@/components/ui/money-text";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmptyRow,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusTags } from "@/features/transactions/components/status-tags";
import type { Transaction } from "@/features/transactions/schemas/transaction.schema";
import { formatTime, formatWhen, lagosDateKey } from "@/lib/format/date";
import { formatPaymentMethod } from "@/lib/format/payment-method";
import { formatPlate } from "@/lib/format/plate";

/**
 * The newest 7 transactions of any status. Today's show the time only; older ones (the list
 * ignores the period) add the date so they are not mistaken for today's.
 */
export function RecentTransactions({
  transactions,
  onOpen,
}: {
  transactions: readonly Transaction[];
  onOpen: (transaction: Transaction) => void;
}) {
  const today = lagosDateKey();
  return (
    <TableContainer label="Recent transactions">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Time</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Method</TableHead>
            <TableHead numeric>Amount</TableHead>
            <TableHead>Status</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableEmptyRow colSpan={6}>No transactions yet.</TableEmptyRow>
          ) : null}
          {transactions.map((transaction) => (
            <TableRow interactive key={transaction.id} onClick={() => onOpen(transaction)}>
              <TableCell className="whitespace-nowrap text-neutral-700">
                <button
                  aria-label={`Open receipt ${transaction.reference}`}
                  className="text-left tabular-nums hover:text-text hover:underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(transaction);
                  }}
                  type="button"
                >
                  {lagosDateKey(transaction.createdAt) === today
                    ? formatTime(transaction.createdAt)
                    : formatWhen(transaction.createdAt, today)}
                </button>
              </TableCell>
              <TableCell>{transaction.service.name}</TableCell>
              <TableCell className="whitespace-nowrap">
                {formatPlate(transaction.vehicle.plate)}
              </TableCell>
              <TableCell>{formatPaymentMethod(transaction.method)}</TableCell>
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
