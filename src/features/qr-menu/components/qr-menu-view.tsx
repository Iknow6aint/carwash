"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, type ChangeEvent } from "react";
import Barcode from "react-barcode";

import { Can } from "@/components/access/can";
import { Notice } from "@/components/feedback/notice";
import { Blueprint } from "@/components/ui/blueprint";
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
import { Switch } from "@/components/ui/switch";
import {
  useBusinessSettings,
  useUpdateBusinessSettings,
} from "@/features/settings/hooks/use-business-settings";
import { useServices, useImportServices } from "@/features/services/hooks/use-services";
import type { Service } from "@/features/services/schemas/service.schema";
import { errorMessage } from "@/lib/api/api-error";
import { formatNaira } from "@/lib/format/money";
import { useCan } from "@/providers/session-provider";

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
 * QR menu & price list: the poster (QR + barcode), the public menu link, the price-visibility
 * setting and the CSV price-list import. Admins change the setting and import; cashiers can view
 * and print the poster.
 */
export function QrMenuView({ businessName, menuUrl }: { businessName: string; menuUrl: string }) {
  const canManage = useCan("services:manage");
  const settings = useBusinessSettings();
  const services = useServices();
  const importServices = useImportServices();
  const updateSettings = useUpdateBusinessSettings();
  const [rows, setRows] = useState<PriceListRow[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const showPrices = settings.data?.showMenuPrices ?? true;

  function copyLink() {
    void navigator.clipboard
      .writeText(menuUrl)
      .then(() => toast("Menu link copied"))
      .catch(() => toast("Copy the link from the poster instead"));
  }

  function printPoster() {
    const poster = document.getElementById("menu-poster");
    if (!poster) return;
    const printWindow = window.open("", "_blank", "width=640,height=900");
    if (!printWindow) {
      window.print();
      return;
    }
    const styles = [...document.styleSheets]
      .map((sheet) => {
        try {
          return [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");
    printWindow.document.write(
      `<!doctype html><html><head><title>QR menu</title>` +
        `<style>${styles}\n` +
        `body{margin:0;background:#fff;color:#000}` +
        `#menu-poster{display:flex!important;flex-direction:column;align-items:center;` +
        `gap:12px;width:80mm;margin:0 auto;padding:8mm;background:#fff;color:#000;text-align:center}` +
        `#menu-poster *{visibility:visible!important}` +
        `#menu-poster h2,#menu-poster p{color:#000!important}` +
        `</style></head><body>${poster.outerHTML}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.onafterprint = () => printWindow.close();
    setTimeout(() => printWindow.print(), 300);
  }

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

  return (
    <div className="flex flex-wrap gap-7">
      <Blueprint className="flex w-full max-w-[420px] flex-[1_1_300px] flex-col items-center gap-3.5 p-5 text-center sm:p-7">
        <div id="menu-poster" className="flex w-full flex-col items-center gap-3.5">
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] tracking-[0.12em] text-accent uppercase">Scan for services</p>
            <h2 className="m-0 text-[26px] leading-tight">{businessName}</h2>
            <p className="text-[13px] text-neutral-700">Services and prices on your phone</p>
          </div>
          <div className="bg-white p-4">
            <QRCodeSVG
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
              marginSize={2}
              size={190}
              title={`Menu for ${businessName}`}
              value={menuUrl}
            />
          </div>
          <div className="bg-white w-full px-2 py-1 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
            <Barcode
              background="#ffffff"
              displayValue={false}
              format="CODE128"
              height={80}
              lineColor="#000000"
              margin={0}
              value={menuUrl}
              width={1}
            />
          </div>
          <p className="max-w-full text-[11px] break-all text-neutral-700">{menuUrl}</p>
        </div>
      </Blueprint>

      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          <Button onClick={printPoster} marks>
            Print poster
          </Button>
          <Button onClick={copyLink} variant="secondary">
            Copy link
          </Button>
          <a
            className="inline-flex min-h-9 items-center border border-divider px-3 font-heading text-[14px] font-semibold hover:bg-neutral-200"
            href={menuUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open menu
          </a>
        </div>

        <Can
          action="services:manage"
          fallback={
            <Notice>Only an admin can change prices, the menu or import a price list.</Notice>
          }
        >
          <div className="flex flex-col gap-2">
            <h3>Menu settings</h3>
            <Switch
              checked={showPrices}
              description="When off, customers see the services but not the prices."
              disabled={!canManage || !settings.data || updateSettings.isPending}
              label="Show prices on the menu"
              onCheckedChange={(checked) =>
                updateSettings.mutate(
                  { showMenuPrices: checked },
                  {
                    onSuccess: ({ message }) => toast(message),
                    onError: (cause) => toast(errorMessage(cause)),
                  },
                )
              }
            />
          </div>

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
            <p className="text-[13px] leading-[1.5] text-neutral-700">
              Two columns: service and price. Existing services are updated by name; new ones are
              added. Up to {MAX_PRICE_LIST_ROWS} rows.
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
                    {counts?.new ?? 0} new · {counts?.update ?? 0} updated ·{" "}
                    {counts?.unchanged ?? 0} unchanged · {counts?.skipped ?? 0} skipped
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
        </Can>
      </div>
    </div>
  );
}
