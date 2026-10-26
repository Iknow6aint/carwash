"use client";

import { useState, type FormEvent } from "react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useServices } from "@/features/services/hooks/use-services";
import { useBusinessSettings } from "@/features/settings/hooks/use-business-settings";
import { ApiError } from "@/lib/api/api-error";
import { formatNaira } from "@/lib/format/money";
import { formatPaymentMethod, type PaymentMethod } from "@/lib/format/payment-method";
import { EM_DASH } from "@/lib/format/text";

import { useCreateTransaction } from "../hooks/use-transactions";
import type { Transaction } from "../schemas/transaction.schema";
import { newIdempotencyKey } from "../utils/idempotency-key";
import {
  BLANK_NEW_TRANSACTION,
  needsConfirmation,
  saveErrorMessage,
  summarise,
  validateNewTransaction,
  type NewTransactionForm as FormState,
} from "../utils/new-transaction";

import { MethodTiles } from "./method-tiles";
import { ReceiptDialog } from "./receipt-dialog";
import { ServiceTiles } from "./service-tiles";
import { StepHeading } from "./step-heading";
import { SummaryPanel } from "./summary-panel";

/**
 * New transaction: three taps to a sale (service → payment method → save). Plate, make/model and
 * a price adjustment are optional and never block the cashier.
 *
 * One `Idempotency-Key` is created when the form opens and reused for every retry of the same
 * sale; it is replaced only after a successful save, so a flaky connection can't save twice.
 */
export function NewTransactionForm() {
  const services = useServices({ active: true });
  const settings = useBusinessSettings();
  const create = useCreateTransaction();
  // The setting defaults to on, so the tick shows while settings load.
  const requirePaymentConfirmation = settings.data?.requirePaymentConfirmation ?? true;

  const [form, setForm] = useState<FormState>(BLANK_NEW_TRANSACTION);
  const [errors, setErrors] = useState<string[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const selected = services.data?.find((service) => service.id === form.serviceId) ?? null;
  const listPriceKobo = selected?.priceKobo ?? null;
  const { totalKobo, adjustmentNote } = summarise(form, listPriceKobo);
  const confirmationFor =
    form.method && needsConfirmation(form.method, requirePaymentConfirmation) ? form.method : null;
  const vehicle = [form.makeModel.trim(), form.plate.trim().toUpperCase()]
    .filter(Boolean)
    .join(" · ");

  function update(patch: Partial<FormState>, clearErrors = false) {
    setForm((current) => ({ ...current, ...patch }));
    if (clearErrors) setErrors([]);
  }

  function selectMethod(method: PaymentMethod) {
    // A new method needs its own confirmation.
    update({ method, confirmed: false }, true);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending) return;
    const result = validateNewTransaction(form, { listPriceKobo, requirePaymentConfirmation });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    create.mutate(
      { input: result.input, idempotencyKey },
      {
        onSuccess: (transaction) => {
          toast(`Saved ${transaction.reference} · dashboard updated`);
          setReceipt(transaction);
          setForm(BLANK_NEW_TRANSACTION);
          setIdempotencyKey(newIdempotencyKey());
        },
        onError: (error) => {
          setErrors([saveErrorMessage(error, form.method)]);
          if (
            error instanceof ApiError &&
            (error.code === "SERVICE_INACTIVE" || error.code === "SERVICE_NOT_FOUND")
          ) {
            void services.refetch();
          }
        },
      },
    );
  }

  return (
    <>
      <form
        className="grid items-start gap-7 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]"
        noValidate
        onSubmit={save}
      >
        <div className="flex min-w-0 flex-col gap-7">
          <section className="flex flex-col gap-2.5">
            <StepHeading id="step-service" step="01">
              Service
            </StepHeading>
            <ServiceTiles
              error={services.error}
              isPending={services.isPending}
              labelledBy="step-service"
              onRetry={() => void services.refetch()}
              onSelect={(service) => update({ serviceId: service.id }, true)}
              selectedId={form.serviceId}
              services={services.data}
            />
          </section>

          <section className="flex flex-col gap-2.5">
            <StepHeading id="step-vehicle" note="Optional" step="02">
              Vehicle
            </StepHeading>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
              <Field label="Plate number">
                {(props) => (
                  <Input
                    {...props}
                    autoCapitalize="characters"
                    autoComplete="off"
                    className="uppercase placeholder:normal-case"
                    inputSize="lg"
                    maxLength={15}
                    onChange={(event) => update({ plate: event.target.value })}
                    placeholder="KJA 482 FX"
                    spellCheck={false}
                    value={form.plate}
                  />
                )}
              </Field>
              <Field label="Make and model">
                {(props) => (
                  <Input
                    {...props}
                    autoComplete="off"
                    inputSize="lg"
                    maxLength={60}
                    onChange={(event) => update({ makeModel: event.target.value })}
                    placeholder="Toyota Corolla"
                    value={form.makeModel}
                  />
                )}
              </Field>
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <StepHeading id="step-method" step="03">
              Payment method
            </StepHeading>
            <MethodTiles labelledBy="step-method" onSelect={selectMethod} value={form.method} />
          </section>
        </div>

        <SummaryPanel
          adjustmentNote={adjustmentNote}
          confirmationFor={confirmationFor}
          errors={errors}
          form={form}
          onAdjustChange={(adjust) => update({ adjust }, true)}
          onAmountChange={(amount) => update({ amount })}
          onClear={() => {
            setForm(BLANK_NEW_TRANSACTION);
            setErrors([]);
          }}
          onConfirmedChange={(confirmed) => update({ confirmed }, true)}
          onReasonChange={(reason) => update({ reason })}
          rows={[
            ["Service", selected?.name ?? EM_DASH],
            ["List price", listPriceKobo === null ? EM_DASH : formatNaira(listPriceKobo)],
            ["Vehicle", vehicle || EM_DASH],
            ["Method", form.method ? formatPaymentMethod(form.method) : EM_DASH],
          ]}
          saving={create.isPending}
          totalKobo={totalKobo}
        />
      </form>
      <ReceiptDialog onClose={() => setReceipt(null)} transaction={receipt} />
    </>
  );
}
