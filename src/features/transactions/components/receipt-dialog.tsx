"use client";

import { useRef, useState, type ReactNode } from "react";

import { BrandMark } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { publicEnv } from "@/config/env";
import { useBusinessSettings } from "@/features/settings/hooks/use-business-settings";
import { cn } from "@/lib/utils";
import { useCan } from "@/providers/session-provider";

import type { Transaction } from "../schemas/transaction.schema";
import { useTransaction } from "../hooks/use-transactions";
import { receiptLines, receiptText, type ReceiptBusiness } from "../utils/receipt";

import { CancelTransactionForm } from "./cancel-transaction-form";

interface ReceiptDialogProps {
  /** The transaction to show (a list row or the sale just saved); `null` closes the dialog. */
  transaction: Transaction | null;
  onClose: () => void;
}

/**
 * The printable receipt, reused by the dashboard, the transactions list and New transaction. It
 * opens at once from the row it was given and refreshes from `GET /transactions/:id`.
 */
export function ReceiptDialog({ transaction, onClose }: ReceiptDialogProps) {
  return (
    <Dialog onOpenChange={(open) => (open ? undefined : onClose())} open={transaction !== null}>
      {transaction ? (
        <ReceiptContent key={transaction.id} onClose={onClose} seed={transaction} />
      ) : null}
    </Dialog>
  );
}

function Line({
  label,
  value,
  muted = true,
}: {
  label: ReactNode;
  value: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-3", muted && "text-[13px] text-neutral-700")}>
      <span className="min-w-0">{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

function ReceiptContent({ seed, onClose }: { seed: Transaction; onClose: () => void }) {
  const { data } = useTransaction(seed.id, seed);
  const transaction = data ?? seed;
  const settings = useBusinessSettings();
  const isAdmin = useCan("transactions:cancel");
  const [mode, setMode] = useState<"view" | "cancel">("view");
  const [copyProblem, setCopyProblem] = useState<string | null>(null);
  const doneRef = useRef<HTMLButtonElement>(null);

  const business: ReceiptBusiness = settings.data ?? {
    name: publicEnv.NEXT_PUBLIC_APP_NAME,
    address: "",
    phone: "",
    receiptFooter: "",
  };
  const lines = receiptLines(transaction);
  const paid = transaction.status === "paid";

  async function copyText() {
    setCopyProblem(null);
    try {
      await navigator.clipboard.writeText(receiptText(transaction, business));
      toast("Receipt text copied");
    } catch {
      setCopyProblem("Couldn't copy here. Select the receipt text and copy it instead.");
    }
  }

  return (
    <DialogContent
      data-print-receipt=""
      hideTitle
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        doneRef.current?.focus();
      }}
      overlayProps={{ "data-print-overlay": "" }}
      size="sm"
      title={`Receipt ${lines.reference}`}
    >
      <div className="flex flex-col items-center gap-0.5 border-b border-dashed border-neutral-400 pb-2.5 text-center">
        <BrandMark className="mb-1.5" marks={false} size={56} />
        <p className="font-heading text-[22px] leading-tight font-semibold">{business.name}</p>
        {business.address ? (
          <p className="text-[12px] text-neutral-700">{business.address}</p>
        ) : null}
        {business.phone ? <p className="text-[12px] text-neutral-700">{business.phone}</p> : null}
      </div>

      <div className="flex justify-between gap-3 text-[12px] text-neutral-700 tabular-nums">
        <span>{lines.reference}</span>
        <span>{lines.dateTime}</span>
      </div>

      <div className="flex flex-col gap-1.5 text-[14px]">
        <Line label={lines.service} muted={false} value={lines.listPrice} />
        {lines.adjustment ? (
          <Line
            label={`Adjusted · ${lines.adjustment.reason}`}
            value={lines.adjustment.difference}
          />
        ) : null}
        <Line label="Vehicle" value={lines.vehicle} />
        <Line label="Paid by" value={lines.method} />
        <Line label="Cashier" value={lines.cashier} />
      </div>

      <div className="flex items-end justify-between border-t border-dashed border-neutral-400 pt-2.5">
        <span className="kicker">Total</span>
        <span
          className={cn(
            "font-heading text-[40px] leading-none font-semibold tabular-nums",
            lines.cancelled && "line-through",
          )}
        >
          {lines.total}
        </span>
      </div>

      {transaction.cancellation ? (
        <p className="border border-text px-3 py-2.5 text-[13px]">
          Cancelled by {transaction.cancellation.by.name} · {transaction.cancellation.reason}. Not
          counted in revenue.
        </p>
      ) : null}

      {business.receiptFooter ? (
        <p className="text-center text-[12px] text-neutral-700">{business.receiptFooter}</p>
      ) : null}

      {mode === "cancel" ? (
        <CancelTransactionForm
          onCancelled={() => setMode("view")}
          onKeep={() => setMode("view")}
          transaction={transaction}
        />
      ) : (
        <div className="flex flex-col gap-2" data-print-hide="">
          <div className="flex flex-wrap justify-end gap-2">
            {isAdmin && paid ? (
              <Button className="mr-auto" onClick={() => setMode("cancel")} variant="ghost">
                Cancel transaction
              </Button>
            ) : null}
            <Button onClick={copyText} variant="secondary">
              Copy text
            </Button>
            <Button onClick={() => window.print()} variant="secondary">
              Print
            </Button>
            <Button onClick={onClose} ref={doneRef}>
              Done
            </Button>
          </div>
          {copyProblem ? (
            <p className="text-[13px]" role="alert">
              {copyProblem}
            </p>
          ) : null}
        </div>
      )}

      {!isAdmin && paid ? (
        <p className="text-center text-[12px] text-neutral-700" data-print-hide="">
          Need to cancel? Ask an admin.
        </p>
      ) : null}
    </DialogContent>
  );
}
