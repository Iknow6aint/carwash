"use client";

import { useState, type FormEvent } from "react";

import { Blueprint } from "@/components/ui/blueprint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/api-error";
import { nairaToKobo, parseNairaInput } from "@/lib/format/money";

import { useImportServices } from "../hooks/use-services";
import { priceListNameKey } from "../utils/price-list";

interface Row {
  key: number;
  name: string;
  price: string;
}

let nextKey = 1;
const blankRow = (): Row => ({ key: nextKey++, name: "", price: "" });

/**
 * Add several services in one form, without a CSV. Existing names get the new price; new names
 * are added active. Empty rows are ignored; invalid or duplicate rows are listed above the button.
 */
export function AddMultipleServicesForm() {
  const importServices = useImportServices();
  const [rows, setRows] = useState<Row[]>(() => [blankRow(), blankRow(), blankRow()]);
  const [errors, setErrors] = useState<string[]>([]);

  function change(key: number, patch: Partial<Pick<Row, "name" | "price">>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    setErrors([]);
  }

  function remove(key: number) {
    setRows((current) =>
      current.length === 1 ? [blankRow()] : current.filter((row) => row.key !== key),
    );
    setErrors([]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const items: Array<{ name: string; priceKobo: number }> = [];
    const next: string[] = [];
    const seen = new Set<string>();

    rows.forEach((row, index) => {
      const name = row.name.trim();
      const price = row.price.trim();
      if (!name && !price) return;
      if (!name) {
        next.push(`Row ${index + 1}: give the service a name.`);
        return;
      }
      if (name.length > 60) {
        next.push(`Row ${index + 1}: keep the name under 60 characters.`);
        return;
      }
      const naira = parseNairaInput(price);
      if (naira === null || naira <= 0) {
        next.push(`Row ${index + 1}: enter a price in whole naira.`);
        return;
      }
      if (naira > 1_000_000) {
        next.push(`Row ${index + 1}: prices can be at most ₦1,000,000.`);
        return;
      }
      const nameKey = priceListNameKey(name);
      if (seen.has(nameKey)) {
        next.push(`Row ${index + 1}: “${name}” is already in this form.`);
        return;
      }
      seen.add(nameKey);
      items.push({ name, priceKobo: nairaToKobo(naira) });
    });

    if (items.length === 0 && next.length === 0) {
      next.push("Add at least one service.");
    }
    if (next.length > 0) {
      setErrors(next);
      return;
    }

    setErrors([]);
    importServices.mutate(
      { items },
      {
        onSuccess: ({ message }) => {
          toast(message);
          setRows([blankRow(), blankRow(), blankRow()]);
        },
        onError: (cause) => setErrors([errorMessage(cause)]),
      },
    );
  }

  return (
    <Blueprint as="section" className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="m-0">Add several services</h3>
        <p className="text-[13px] text-neutral-700">
          Save a whole price list at once. Names that already exist get the new price.
        </p>
      </div>
      <form className="flex flex-col gap-2.5" noValidate onSubmit={submit}>
        {rows.map((row, index) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_130px_auto] items-center gap-2"
            key={row.key}
          >
            <Input
              aria-label={`Service ${index + 1} name`}
              autoComplete="off"
              maxLength={60}
              onChange={(event) => change(row.key, { name: event.target.value })}
              placeholder="Service name"
              value={row.name}
            />
            <Input
              aria-label={`Service ${index + 1} price`}
              autoComplete="off"
              inputMode="numeric"
              onChange={(event) => change(row.key, { price: event.target.value })}
              placeholder="Price (₦)"
              value={row.price}
            />
            <Button
              aria-label={`Remove service ${index + 1}`}
              onClick={() => remove(row.key)}
              type="button"
              variant="ghost"
            >
              ×
            </Button>
          </div>
        ))}
        {errors.length > 0 ? (
          <div className="flex flex-col gap-1 border border-text px-3 py-2.5 text-[13px]" role="alert">
            {errors.map((error) => (
              <p className="m-0" key={error}>
                {error}
              </p>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setRows((current) => [...current, blankRow()])} variant="ghost">
            + Add another service
          </Button>
          <Button
            className="ml-auto"
            loading={importServices.isPending}
            type="submit"
            variant="secondary"
          >
            Save services
          </Button>
        </div>
      </form>
    </Blueprint>
  );
}
