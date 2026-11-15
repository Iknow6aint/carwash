"use client";

import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";

import { Can } from "@/components/access/can";
import { Notice } from "@/components/feedback/notice";
import { Blueprint } from "@/components/ui/blueprint";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { BulkServiceUpload } from "@/features/services/components/bulk-service-upload";
import {
  useBusinessSettings,
  useUpdateBusinessSettings,
} from "@/features/settings/hooks/use-business-settings";
import { errorMessage } from "@/lib/api/api-error";
import { useCan } from "@/providers/session-provider";

/**
 * QR menu & price list: the poster (QR + barcode), the public menu link and the price-visibility
 * setting. Admins change the setting and import a price list; cashiers can view and print the
 * poster.
 */
export function QrMenuView({ businessName, menuUrl }: { businessName: string; menuUrl: string }) {
  const canManage = useCan("services:manage");
  const settings = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
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
          <BulkServiceUpload />
        </Can>
      </div>
    </div>
  );
}
