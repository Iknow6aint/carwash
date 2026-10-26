"use client";

import { useState, type FormEvent } from "react";

import { Blueprint } from "@/components/ui/blueprint";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ApiError, errorMessage } from "@/lib/api/api-error";

import { useCreateService } from "../hooks/use-services";
import {
  validateServiceDraft,
  type ServiceDraft,
  type ServiceDraftErrors,
} from "../utils/service-form";

const BLANK: ServiceDraft = { name: "", price: "" };

/** Admin: add a service with a name and a whole-naira price. Errors sit under their field. */
export function AddServiceForm() {
  const [draft, setDraft] = useState<ServiceDraft>(BLANK);
  const [errors, setErrors] = useState<ServiceDraftErrors & { form?: string }>({});
  const create = useCreateService();

  function change(field: keyof ServiceDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateServiceDraft(draft);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    create.mutate(result.value, {
      onSuccess: ({ data, message }) => {
        toast(message || `${data.name} added`);
        setDraft(BLANK);
        setErrors({});
      },
      onError: (cause) => {
        if (cause instanceof ApiError && cause.code === "SERVICE_NAME_TAKEN")
          setErrors({ name: cause.message });
        else setErrors({ form: errorMessage(cause) });
      },
    });
  }

  return (
    <Blueprint as="section" aria-label="Add a service" className="p-3.5">
      <form className="flex flex-wrap items-start gap-2.5" noValidate onSubmit={submit}>
        <Field className="flex-[2_1_220px]" error={errors.name} label="New service">
          {(props) => (
            <Input
              {...props}
              maxLength={60}
              onChange={(event) => change("name", event.target.value)}
              placeholder="e.g. Tyre shine"
              value={draft.name}
            />
          )}
        </Field>
        <Field className="flex-[1_1_140px]" error={errors.price} label="Price (₦)">
          {(props) => (
            <Input
              {...props}
              inputMode="numeric"
              onChange={(event) => change("price", event.target.value)}
              placeholder="2000"
              value={draft.price}
            />
          )}
        </Field>
        <Button className="mt-[22px]" loading={create.isPending} type="submit">
          Add service
        </Button>
        {errors.form ? (
          <p className="basis-full text-[13px]" role="alert">
            {errors.form}
          </p>
        ) : null}
      </form>
    </Blueprint>
  );
}
