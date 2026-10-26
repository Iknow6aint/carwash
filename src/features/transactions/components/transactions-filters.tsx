"use client";

import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Seg, type SegOption } from "@/components/ui/seg";
import { Select } from "@/components/ui/select";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/format/payment-method";

import type { StatusFilter, TransactionRange } from "../schemas/transaction.schema";
import { SEARCH_MAX_LENGTH, type TransactionFilters } from "../utils/transaction-filters";

const RANGE_OPTIONS: readonly SegOption<TransactionRange>[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All" },
];

const STATUS_OPTIONS: ReadonlyArray<{ value: StatusFilter | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "adjusted", label: "Adjusted" },
  { value: "cancelled", label: "Cancelled" },
];

/** Search, range, method, status and Export CSV, in the prototype's order. */
export function TransactionsFilters({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  exportHref,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  filters: TransactionFilters;
  onFiltersChange: (patch: Partial<TransactionFilters>) => void;
  /** `/api/export/transactions?...` with the current filters. */
  exportHref: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Input
        aria-label="Search transactions"
        className="w-auto min-w-0 flex-[1_1_260px]"
        maxLength={SEARCH_MAX_LENGTH}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search plate, reference, service or cashier"
        type="search"
        value={search}
      />
      <Seg
        label="Date range"
        onChange={(range) => onFiltersChange({ range })}
        options={RANGE_OPTIONS}
        value={filters.range}
      />
      <Select
        aria-label="Payment method"
        onChange={(event) =>
          onFiltersChange({ method: event.target.value as PaymentMethod | "all" })
        }
        value={filters.method}
        wrapperClassName="w-auto"
      >
        <option value="all">All methods</option>
        {PAYMENT_METHODS.map((method) => (
          <option key={method} value={method}>
            {PAYMENT_METHOD_LABELS[method]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Status"
        onChange={(event) =>
          onFiltersChange({ status: event.target.value as StatusFilter | "all" })
        }
        value={filters.status}
        wrapperClassName="w-auto"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {/* A plain link: the Route Handler streams the CSV as an attachment, so the page stays put. */}
      <a
        className={buttonVariants({ variant: "secondary", className: "text-text hover:text-text" })}
        href={exportHref}
      >
        <Download aria-hidden="true" className="size-4" strokeWidth={1.5} />
        Export CSV
      </a>
    </div>
  );
}
