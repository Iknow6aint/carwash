"use client";

import { FormErrors } from "@/components/feedback/form-errors";
import { Blueprint } from "@/components/ui/blueprint";
import { Button } from "@/components/ui/button";
import { Checkbox, checkboxClassName } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format/money";
import type { PaymentMethod } from "@/lib/format/payment-method";
import { cn } from "@/lib/utils";

import { confirmationCopy, type NewTransactionForm } from "../utils/new-transaction";

interface SummaryPanelProps {
  rows: ReadonlyArray<readonly [label: string, value: string]>;
  form: NewTransactionForm;
  onAdjustChange: (adjust: boolean) => void;
  onAmountChange: (amount: string) => void;
  onReasonChange: (reason: string) => void;
  totalKobo: number;
  adjustmentNote: string | null;
  /** The method whose confirmation tick shows, or null when none is needed. */
  confirmationFor: PaymentMethod | null;
  onConfirmedChange: (confirmed: boolean) => void;
  errors: readonly string[];
  saving: boolean;
  onClear: () => void;
}

/**
 * The sticky summary (a blueprint): what is being sold, an optional price adjustment with its
 * reason, the total in the largest type on screen, the transfer/POS confirmation, errors, and the
 * one primary action.
 */
export function SummaryPanel({
  rows,
  form,
  onAdjustChange,
  onAmountChange,
  onReasonChange,
  totalKobo,
  adjustmentNote,
  confirmationFor,
  onConfirmedChange,
  errors,
  saving,
  onClear,
}: SummaryPanelProps) {
  return (
    <Blueprint
      aria-label="Summary"
      as="aside"
      className="flex min-w-0 flex-col gap-3.5 p-5 md:sticky md:top-[76px] lg:top-6"
    >
      <p className="kicker">Summary</p>
      <dl className="flex flex-col text-[14px]">
        {rows.map(([label, value]) => (
          <div className="flex justify-between gap-3 border-b border-divider py-[7px]" key={label}>
            <dt className="text-neutral-700">{label}</dt>
            <dd className="m-0 min-w-0 text-right break-words tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <Checkbox
        checked={form.adjust}
        label="Adjust price"
        onChange={(event) => onAdjustChange(event.target.checked)}
      />
      {form.adjust ? (
        <div className="flex flex-col gap-2.5 pl-6">
          <Field label="Amount charged (₦)">
            {(props) => (
              <Input
                {...props}
                inputMode="numeric"
                inputSize="lg"
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="2500"
                value={form.amount}
              />
            )}
          </Field>
          <Field label="Reason (saved with the transaction)">
            {(props) => (
              <Input
                {...props}
                inputSize="lg"
                maxLength={140}
                onChange={(event) => onReasonChange(event.target.value)}
                placeholder="Regular customer discount"
                value={form.reason}
              />
            )}
          </Field>
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-3 pt-1.5">
        <span className="kicker">Total</span>
        <output
          aria-live="polite"
          className="font-heading text-[44px] leading-none font-semibold tabular-nums"
        >
          {formatNaira(totalKobo)}
        </output>
      </div>
      {adjustmentNote ? (
        <p className="-mt-2 text-right text-[12px] text-neutral-700">{adjustmentNote}</p>
      ) : null}

      {confirmationFor ? (
        <label className="flex cursor-pointer items-start gap-2.5 border border-accent-300 bg-accent-100 p-3 text-[13px] leading-[1.4] text-accent-900">
          <input
            checked={form.confirmed}
            className={cn(checkboxClassName, "mt-0.5")}
            onChange={(event) => onConfirmedChange(event.target.checked)}
            type="checkbox"
          />
          <span>{confirmationCopy(confirmationFor)}</span>
        </label>
      ) : null}

      <FormErrors errors={errors} />

      <Button className="mt-1" loading={saving} marks size="xl" type="submit">
        Save &amp; show receipt
      </Button>
      <Button className="self-center" disabled={saving} onClick={onClear} variant="ghost">
        Clear
      </Button>
    </Blueprint>
  );
}
