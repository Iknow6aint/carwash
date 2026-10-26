import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Nothing here (yet): one quiet sentence, optionally the next step. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-10 text-center", className)}>
      <p className="text-[14px] text-neutral-700">{title}</p>
      {description ? <p className="max-w-md text-[13px] text-neutral-600">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
