"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import { FormErrors } from "@/components/feedback/form-errors";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Seg, type SegOption } from "@/components/ui/seg";
import { cn } from "@/lib/utils";

import {
  demoWhatsAppUrl,
  emptyDemoRequest,
  parseDemoRequest,
  WASH_BAY_OPTIONS,
  type DemoRequest,
  type DemoRequestInput,
  type WashBays,
} from "../../utils/demo-request";
import styles from "../landing.module.css";

import { DemoSent } from "./demo-sent";

const BAY_OPTIONS: readonly SegOption<WashBays>[] = WASH_BAY_OPTIONS.map((bays) => ({
  value: bays,
  label: bays,
}));

type TextField = "name" | "business" | "phone";

/**
 * "Book a demo": checks the details, then opens WhatsApp with them typed into a message to
 * `whatsAppNumber`. Nothing is sent until the visitor presses send there.
 */
export function DemoForm({ whatsAppNumber }: { whatsAppNumber: string }) {
  const [values, setValues] = useState<DemoRequestInput>(emptyDemoRequest);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<DemoRequest | null>(null);

  if (sent) return <DemoSent request={sent} whatsAppUrl={demoWhatsAppUrl(whatsAppNumber, sent)} />;

  const change = (field: TextField) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseDemoRequest(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(demoWhatsAppUrl(whatsAppNumber, result.data), "_blank", "noopener,noreferrer");
    setSent(result.data);
  };

  // Inputs carry no `name`: without JavaScript a submit must not put details in the URL.
  return (
    <form className="flex flex-col gap-3.5" noValidate onSubmit={submit}>
      <h3 className="m-0 text-[30px]">Book a demo</h3>
      <Field label="Your name">
        {(props) => (
          <Input
            {...props}
            autoComplete="name"
            inputSize="lg"
            onChange={change("name")}
            value={values.name}
          />
        )}
      </Field>
      <Field label="Car wash name">
        {(props) => (
          <Input
            {...props}
            autoComplete="organization"
            inputSize="lg"
            onChange={change("business")}
            placeholder="Splash Point Car Wash"
            value={values.business}
          />
        )}
      </Field>
      <Field label="Phone or WhatsApp">
        {(props) => (
          <Input
            {...props}
            autoComplete="tel"
            inputMode="tel"
            inputSize="lg"
            onChange={change("phone")}
            placeholder="0803 000 0000"
            type="tel"
            value={values.phone}
          />
        )}
      </Field>
      <div className="flex flex-col">
        <span aria-hidden="true" className="mb-[5px] text-[12px] text-neutral-700">
          Wash bays
        </span>
        <Seg
          className="self-start"
          label="Wash bays"
          onChange={(bays) => setValues((current) => ({ ...current, bays }))}
          options={BAY_OPTIONS}
          value={values.bays}
        />
      </div>
      <FormErrors errors={error ? [error] : []} />
      <Button className={cn(styles.lift, "mt-1.5 [--press:0.98]")} marks size="xl" type="submit">
        Request a demo
      </Button>
    </form>
  );
}
