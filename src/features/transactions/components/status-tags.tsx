import { Tag } from "@/components/ui/tag";

import type { Transaction } from "../schemas/transaction.schema";

/** Paid (accent), Cancelled (neutral) and Adjusted (outline, beside the status). */
export function StatusTags({
  transaction,
}: {
  transaction: Pick<Transaction, "status" | "isAdjusted">;
}) {
  return (
    <div className="flex gap-1">
      {transaction.status === "paid" ? (
        <Tag tone="accent">Paid</Tag>
      ) : (
        <Tag tone="neutral">Cancelled</Tag>
      )}
      {transaction.isAdjusted ? <Tag tone="outline">Adjusted</Tag> : null}
    </div>
  );
}
