"use client";

import { useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/api-error";
import { formatNaira } from "@/lib/format/money";

import { useImportServices, useServices } from "../hooks/use-services";
import type { Service } from "../schemas/service.schema";
import {
  MAX_PRICE_LIST_ROWS,
  PRICE_LIST_TEMPLATE,
  parsePriceListCsv,
  priceListNameKey,
  type PriceListRow,
} from "../utils/price-list";

type RowStatus = "new" | "update" | "unchanged" | "skipped";

const STATUS_LABEL: Record<RowStatus, string> = {
  new: "New",
  update: "Updated",
  unchanged: "No change",
  skipped: "Skipped",
};

const STATUS_TONE: Record<RowStatus, "accent" | "outline" | "neutral"> = {
  new: "accent",
  update: "outline",
  unchanged: "neutral",
  skipped: "neutral",
};

function statusOf(row: PriceListRow, existing: readonly Service[]): RowStatus {
  if (row.error) return "skipped";
  const match = existing.find(
    (service) => priceListNameKey(service.name) === priceListNameKey(row.name),
  );
  if (!match) return "new";
  return match.priceKobo === row.priceKobo ? "unchanged" : "update";
}

/**
 * CSV price-list import: two columns, service and price. It shows a preview before writing:
 * existing names get the new price, new names are added, and invalid or duplicate rows are
 * skipped. Used on Services & prices and QR menu.
 */
export function BulkServiceUpload() {
  const services = useServices();
  const importServices = useImportServices();
  const [rows, setRows] = useState<PriceListRow[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const existing = services.data ?? [];
  const importable =
    rows?.filter((row) => !row.error && statusOf(row, existing) !== "unchanged") ?? [];
  const counts = rows
    ? rows.reduce(
        (total, row) => {
          total[statusOf(row, existing)] += 1;
          return total;
        },
        { new: 0, update: 0, unchanged: 0, skipped: 0 },
      )
    : null;

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([PRICE_LIST_TEMPLATE], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cartory-price-list-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportError(null);
    setFileError(null);
    if (!services.data) {
      setFileError("Services are still loading. Try again in a moment.");
      return;
    }
    const parsed = parsePriceListCsv(await file.text());
    if (!parsed.ok) {
      setRows(null);
      setFileError(parsed.error);
      return;
    }
    setRows(parsed.rows);
  }

  function importRows() {
    if (!rows) return;
    const items = rows.flatMap((row) =>
      row.error || row.priceKobo === null || statusOf(row, existing) === "unchanged"
        ? []
        : [{ name: row.name, priceKobo: row.priceKobo }],
    );
    if (items.length === 0) {
      setImportError("No row can be imported. Fix the skipped rows and try again.");
      return;
    }
    setImportError(null);
    importServices.mutate(
      { items },
      {
        onSuccess: ({ message }) => {
          toast(message);
          setRows(null);
        },
        onError: (cause) => setImportError(errorMessage(cause)),
      },
    );
  }

  return (
    <section aria-labelledby="bulk-upload-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 mr-auto" id="bulk-upload-title">
          Bulk upload services
        </h3>
        <Button onClick={downloadTemplate} variant="ghost">
          Download template
        </Button>
        <label className="inline-flex min-h-9 cursor-pointer items-center border border-divider px-3 font-heading text-[14px] font-semibold hover:bg-neutral-200">
          Choose CSV
          <input
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => void chooseFile(event)}
            type="file"
          />
        </label>
      </div>
      <p className="max-w-[680px] text-[13px] leading-[1.5] text-neutral-700">
        Two columns: service and price. Existing services are updated by name; new ones are added.
        Up to {MAX_PRICE_LIST_ROWS} rows.
      </p>

      {fileError ? (
        <p className="border border-text px-3 py-2.5 text-[13px]" role="alert">
          {fileError}
        </p>
      ) : null}

      {rows ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-neutral-700">
            <span>
              {counts?.new ?? 0} new · {counts?.update ?? 0} updated · {counts?.unchanged ?? 0}{" "}
              unchanged · {counts?.skipped ?? 0} skipped
            </span>
          </div>
          <TableContainer label="Price list preview">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Service</TableHead>
                  <TableHead numeric>Price</TableHead>
                  <TableHead>Result</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const status = statusOf(row, existing);
                  return (
                    <TableRow key={`${row.line}:${row.name}`}>
                      <TableCell className="font-medium">{row.name || "—"}</TableCell>
                      <TableCell numeric>
                        {row.priceKobo === null ? "—" : formatNaira(row.priceKobo)}
                      </TableCell>
                      <TableCell>
                        <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                        {row.error ? (
                          <span className="mt-1 block text-[12px] text-neutral-700">
                            {row.error}
                          </span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {importError ? (
            <p className="border border-text px-3 py-2.5 text-[13px]" role="alert">
              {importError}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={() => setRows(null)} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={importable.length === 0}
              loading={importServices.isPending}
              onClick={importRows}
            >
              Import {importable.length} {importable.length === 1 ? "service" : "services"}
            </Button>
          </div>
        </div>
      ) : services.isPending ? (
        <TableSkeleton columns={3} label="Loading services" />
      ) : null}
    </section>
  );
}
