import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** The four "+" registration marks. Put them first inside any element with the `blueprint` class. */
export function Corners() {
  return (
    <>
      <i aria-hidden="true" className="corner tl" />
      <i aria-hidden="true" className="corner tr" />
      <i aria-hidden="true" className="corner bl" />
      <i aria-hidden="true" className="corner br" />
    </>
  );
}

interface BlueprintProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "aside" | "article";
}

/**
 * A blueprint object: square, hairline-bordered, unfilled, with corner registration marks. Cards,
 * KPI tiles, the summary panel and receipts are all Blueprints (PROJECT_GUIDE §9).
 */
export function Blueprint({ as: Tag = "div", className, children, ...props }: BlueprintProps) {
  return (
    <Tag className={cn("blueprint border border-divider", className)} {...props}>
      <Corners />
      {children}
    </Tag>
  );
}
