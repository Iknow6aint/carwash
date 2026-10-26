"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/api-error";

import { useCancelTransaction } from "../hooks/use-transactions";
import { cancelTransactionSchema, type Transaction } from "../schemas/transaction.schema";

/**
 * The receipt's cancel mode (admin): a required reason, "Keep transaction" and "Cancel
 * transaction" (secondary with an ink border, never red). The API's message shows on failure.
 */
export function CancelTransactionForm({
  transaction,
  onKeep,
  onCancelled,
}: {
  transaction: Transaction;
  onKeep: () => void;
  onCancelled: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | undefined>();
  const cancel = useCancelTransaction();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = cancelTransactionSchema.safeParse({ reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    cancel.mutate(
      { id: transaction.id, reason: parsed.data.reason },
      {
        onSuccess: ({ message }) => {
          toast(message || `${transaction.reference} cancelled · removed from revenue`);
          onCancelled();
        },
        onError: (cause) => setError(errorMessage(cause)),
      },
    );
  }

  return (
    <form className="flex flex-col gap-2 pt-1.5" data-print-hide="" noValidate onSubmit={submit}>
      <Field error={error} label="Why is this transaction being cancelled?">
        {(props) => (
          <Input
            {...props}
            autoFocus
            maxLength={140}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Duplicate entry"
            value={reason}
          />
        )}
      </Field>
      <div className="flex flex-wrap justify-end gap-2">
        <Button disabled={cancel.isPending} onClick={onKeep} variant="ghost">
          Keep transaction
        </Button>
        <Button
          className="border-text"
          loading={cancel.isPending}
          type="submit"
          variant="secondary"
        >
          Cancel transaction
        </Button>
      </div>
    </form>
  );
}
