import { Plus } from "lucide-react";
import Link from "next/link";

import { Corners } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { formatLongDate } from "@/lib/format/date";

/**
 * Every desk page starts with this: today's long date (Lagos) over the page title at 40 px, and
 * the primary "New transaction" button on every page except New transaction itself.
 */
export function PageHeader({
  title,
  showNewTransaction = true,
}: {
  title: string;
  showNewTransaction?: boolean;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[12px] text-neutral-700">{formatLongDate(new Date())}</p>
        <h1>{title}</h1>
      </div>
      {showNewTransaction ? (
        <Link className={buttonVariants({ size: "lg", marks: true })} href="/new">
          <Corners />
          <Plus aria-hidden="true" className="size-4" strokeWidth={1.5} />
          New transaction
        </Link>
      ) : null}
    </header>
  );
}
