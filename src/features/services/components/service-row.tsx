"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { toast } from "@/components/ui/toast";
import { ApiError, errorMessage } from "@/lib/api/api-error";
import { formatNaira } from "@/lib/format/money";

import { useUpdateService } from "../hooks/use-services";
import type { Service, UpdateServiceInput } from "../schemas/service.schema";
import {
  draftFromService,
  validateServiceDraft,
  type ServiceDraft,
  type ServiceDraftErrors,
} from "../utils/service-form";

interface ServiceRowProps {
  service: Service;
  canManage: boolean;
  editing: boolean;
  onEdit: () => void;
  onDoneEditing: () => void;
}

/** One service. Admins edit name and price inline, and deactivate or activate it. */
export function ServiceRow({
  service,
  canManage,
  editing,
  onEdit,
  onDoneEditing,
}: ServiceRowProps) {
  const update = useUpdateService();
  const [rowError, setRowError] = useState<string | null>(null);

  function toggle() {
    setRowError(null);
    update.mutate(
      { id: service.id, input: { isActive: !service.isActive } },
      {
        onSuccess: ({ message }) => toast(message),
        onError: (cause) => setRowError(errorMessage(cause)),
      },
    );
  }

  if (editing) {
    return <EditServiceRow onDone={onDoneEditing} service={service} />;
  }

  const dim = service.isActive ? undefined : "opacity-55";
  return (
    <TableRow>
      <TableCell className="font-medium">
        <span className={dim}>{service.name}</span>
        {rowError ? (
          <p className="mt-1 text-[13px] font-normal" role="alert">
            {rowError}
          </p>
        ) : null}
      </TableCell>
      <TableCell className={dim} numeric>
        {formatNaira(service.priceKobo)}
      </TableCell>
      <TableCell className="text-neutral-700" numeric>
        {service.soldLast30Days}
      </TableCell>
      <TableCell>
        {service.isActive ? <Tag tone="accent">Active</Tag> : <Tag tone="neutral">Inactive</Tag>}
      </TableCell>
      {canManage ? (
        <TableCell>
          <div className="flex justify-end gap-1">
            <Button aria-label={`Edit ${service.name}`} onClick={onEdit} size="sm" variant="ghost">
              Edit
            </Button>
            <Button
              aria-label={`${service.isActive ? "Deactivate" : "Activate"} ${service.name}`}
              loading={update.isPending}
              onClick={toggle}
              size="sm"
              variant="ghost"
            >
              {service.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </TableCell>
      ) : null}
    </TableRow>
  );
}

function EditServiceRow({ service, onDone }: { service: Service; onDone: () => void }) {
  const [draft, setDraft] = useState<ServiceDraft>(() => draftFromService(service));
  const [errors, setErrors] = useState<ServiceDraftErrors & { form?: string }>({});
  const update = useUpdateService();
  const formId = useId();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateServiceDraft(draft);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const input: UpdateServiceInput = {
      ...(result.value.name !== service.name ? { name: result.value.name } : {}),
      ...(result.value.priceKobo !== service.priceKobo
        ? { priceKobo: result.value.priceKobo }
        : {}),
    };
    if (Object.keys(input).length === 0) {
      onDone();
      return;
    }
    update.mutate(
      { id: service.id, input },
      {
        onSuccess: ({ message }) => {
          toast(message);
          onDone();
        },
        onError: (cause) => {
          if (cause instanceof ApiError && cause.code === "SERVICE_NAME_TAKEN")
            setErrors({ name: cause.message });
          else setErrors({ form: errorMessage(cause) });
        },
      },
    );
  }

  const nameError = errors.name ?? errors.form;
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell>
        <form id={formId} noValidate onSubmit={save} />
        <Input
          aria-describedby={nameError ? `${formId}-name-error` : undefined}
          aria-invalid={errors.name ? true : undefined}
          aria-label="Service name"
          // Focus moves to the row being edited.
          autoFocus
          form={formId}
          maxLength={60}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          value={draft.name}
        />
        {nameError ? (
          <p className="mt-1 text-[13px]" id={`${formId}-name-error`} role="alert">
            {nameError}
          </p>
        ) : null}
      </TableCell>
      <TableCell numeric>
        <Input
          aria-describedby={errors.price ? `${formId}-price-error` : undefined}
          aria-invalid={errors.price ? true : undefined}
          aria-label="Price in naira"
          className="ml-auto block max-w-[120px] text-right"
          form={formId}
          inputMode="numeric"
          onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
          value={draft.price}
        />
        {errors.price ? (
          <p className="mt-1 text-[13px]" id={`${formId}-price-error`} role="alert">
            {errors.price}
          </p>
        ) : null}
      </TableCell>
      <TableCell className="text-neutral-700" numeric>
        {service.soldLast30Days}
      </TableCell>
      <TableCell />
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button form={formId} loading={update.isPending} size="sm" type="submit">
            Save
          </Button>
          <Button disabled={update.isPending} onClick={onDone} size="sm" variant="ghost">
            Cancel
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
