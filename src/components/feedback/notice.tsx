import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** An information notice: accent-100 fill, accent-300 edge, accent-900 text. */
export function Notice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border border-accent-300 bg-accent-100 px-3.5 py-3 text-[14px] text-accent-900",
        className,
      )}
      role="note"
    >
      {children}
    </div>
  );
}
