import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Blueprint } from "./blueprint";
import { Skeleton } from "./skeleton";

interface StatTileProps {
  /** Kicker, e.g. "Today revenue". */
  label: ReactNode;
  /** The figure: the biggest thing on screen. */
  value?: ReactNode;
  /** Quiet line under the value ("Average ₦3,500 per car"). */
  helper?: ReactNode;
  /** `lg` 52 px (dashboard), `md` 38 px (reports). */
  size?: "md" | "lg";
  /** Replaces `value` (e.g. the payment-method split). */
  children?: ReactNode;
  className?: string;
}

/** KPI tile: a blueprint with a kicker, a large condensed tabular figure and a helper line. */
export function StatTile({
  label,
  value,
  helper,
  size = "lg",
  children,
  className,
}: StatTileProps) {
  return (
    <Blueprint
      className={cn(
        "flex min-w-0 flex-col",
        size === "lg" ? "gap-2 p-5" : "gap-1.5 px-5 py-3.5",
        className,
      )}
    >
      <div className="kicker">{label}</div>
      {children ?? (
        <div
          className={cn(
            "font-heading leading-none font-semibold tabular-nums",
            size === "lg" ? "text-[52px]" : "text-[38px]",
          )}
        >
          {value}
        </div>
      )}
      {helper ? (
        <div className={cn("text-neutral-700", size === "lg" ? "text-[13px]" : "text-[12px]")}>
          {helper}
        </div>
      ) : null}
    </Blueprint>
  );
}

/** A StatTile placeholder with the same footprint. */
export function StatTileSkeleton({ size = "lg" }: { size?: "md" | "lg" }) {
  return (
    <Blueprint className={cn("flex flex-col", size === "lg" ? "gap-3 p-5" : "gap-2 px-5 py-3.5")}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className={size === "lg" ? "h-[52px] w-40" : "h-[38px] w-32"} />
      <Skeleton className="h-3 w-32" />
    </Blueprint>
  );
}
