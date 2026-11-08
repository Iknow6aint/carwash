import type { ReactNode } from "react";

import { Blueprint } from "@/components/ui/blueprint";
import { cn } from "@/lib/utils";

import styles from "./landing.module.css";

/** A bento card in Features: blueprint frame, kicker, cursor spotlight, accent edge on hover. */
export function FeatureCard({
  kicker,
  reveal,
  wide = false,
  children,
}: {
  kicker: string;
  /** Scroll-reveal delay in ms. */
  reveal: number;
  /** Spans the whole row (the Record card). */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Blueprint
      as="article"
      className={cn(
        styles.spot,
        "flex flex-col gap-3.5 px-5 py-7 transition-[border-color] duration-300 hover:border-accent-400",
        wide && cn(styles.spotWide, "col-span-full min-h-[240px]"),
      )}
      data-reveal={reveal}
      data-spotlight=""
    >
      <p className="text-[11px] tracking-[0.12em] text-accent uppercase">{kicker}</p>
      {children}
    </Blueprint>
  );
}
