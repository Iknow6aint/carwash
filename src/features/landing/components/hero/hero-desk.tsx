import { Search } from "lucide-react";
import Image from "next/image";

import { Blueprint } from "@/components/ui/blueprint";
import { cn } from "@/lib/utils";

import type { HeroFrame } from "../../utils/hero-frame";
import { MOCK_KICKER } from "../landing-classes";
import styles from "../landing.module.css";

import { HeroDeskSummary } from "./hero-desk-summary";
import { HeroReceipt } from "./hero-receipt";

const TAP = "scale-95 ring-4 ring-accent/35";

/** The New transaction screen, driven by the loop's current frame. */
export function HeroDesk({ frame }: { frame: HeroFrame }) {
  return (
    <Blueprint className={cn(styles.enterDesk, "flex flex-col bg-neutral-100 p-0 shadow-lg")}>
      <div className="flex items-center gap-2 border-b border-divider px-3.5 py-2.5">
        <Image
          alt=""
          className="size-5 object-contain"
          height={20}
          src="/brand/cartory-mark.png"
          width={20}
        />
        <span className="font-heading text-[15px] font-semibold">New transaction</span>
        <span className="ml-auto text-[11px] text-neutral-700">Splash Point Car Wash · Tunde</span>
      </div>
      <div className="relative grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-3.5 p-3.5">
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className={MOCK_KICKER}>01 Services</span>
            <span className="text-[10px] text-neutral-700">{frame.selectedCount}</span>
          </div>
          <div
            className={cn(
              "flex h-7 items-center gap-1.5 border px-2 text-[12px] transition-colors duration-200",
              frame.searching ? "border-accent" : "border-divider",
            )}
          >
            <Search className="size-3 flex-none" strokeWidth={1.5} />
            <span className={frame.searching ? "text-text" : "text-neutral-600"}>
              {frame.searching ? "eng" : "Search services"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {frame.tiles.map((tile) => (
              <div
                className={cn(
                  "relative flex min-h-[52px] flex-col gap-1 border p-2 transition-all duration-300 ease-(--cw-ease)",
                  tile.selected ? "border-accent bg-accent-100" : "border-divider",
                  tile.tapped && TAP,
                  tile.dimmed && "opacity-35",
                )}
                key={tile.name}
              >
                <span className="text-[11px] leading-[1.15] font-medium">{tile.name}</span>
                <span className="mt-auto font-heading text-[15px] leading-none font-semibold">
                  {tile.price}
                </span>
                <span
                  className={cn(
                    "absolute top-[5px] right-[5px] size-3 bg-accent text-center text-[9px] leading-3 font-bold text-bg transition-transform duration-300 ease-(--cw-spring)",
                    tile.selected ? "scale-100" : "scale-0",
                  )}
                >
                  ✓
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-700">Plate number</span>
            <div
              className={cn(
                "flex h-7 items-center border px-2 text-[13px] tracking-[0.04em] transition-colors duration-200",
                frame.typingPlate ? "border-accent" : "border-divider",
              )}
            >
              {frame.plate}
              <span
                className={cn(
                  "ml-0.5 h-3.5 w-px bg-accent",
                  frame.typingPlate ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          </div>
          <span className={MOCK_KICKER}>02 Payment method</span>
          <div className="grid grid-cols-2 gap-1.5">
            {frame.methods.map((method) => (
              <div
                className={cn(
                  "border p-2 text-center text-[12px] font-medium transition-all duration-300 ease-(--cw-ease)",
                  method.selected ? "border-accent bg-accent-100" : "border-divider",
                  method.tapped && TAP,
                )}
                key={method.label}
              >
                {method.label}
              </div>
            ))}
          </div>
        </div>
        <HeroDeskSummary frame={frame} />
        <HeroReceipt shown={frame.receiptShown} />
      </div>
    </Blueprint>
  );
}
