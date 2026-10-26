import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { Skeleton } from "./skeleton";

/**
 * Horizontally scrollable table area (tables are wider than a phone). Focusable so keyboard users
 * can scroll it, which is why it needs an accessible name.
 */
export function TableContainer({
  label,
  className,
  children,
}: {
  /** Accessible name, e.g. "Recent transactions". */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-label={label}
      className={cn("min-w-0 overflow-x-auto focus-visible:outline-offset-0", className)}
      role="region"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

/** Industry `.table`: 14 px body, quiet caps headings, hairline row rules. */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full border-collapse text-[14px]", className)} {...props} />;
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

/** A row. `interactive` rows (open a receipt) show a pointer. */
export function TableRow({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={cn("hover:bg-neutral-100", interactive && "cursor-pointer", className)}
      {...props}
    />
  );
}

/** Column heading. `numeric` right-aligns money and counts. */
export function TableHead({
  className,
  numeric = false,
  scope = "col",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      className={cn(
        "border-b border-divider px-[7px] py-[7px] text-left text-[11px] font-medium tracking-[0.08em] whitespace-nowrap text-neutral-700 uppercase",
        numeric && "text-right",
        className,
      )}
      scope={scope}
      {...props}
    />
  );
}

/** Body cell. `numeric` right-aligns with tabular figures so digits line up. */
export function TableCell({
  className,
  numeric = false,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        "border-b border-neutral-200 px-[7px] py-[7px] align-middle",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

/** One full-width row for "nothing here" inside a table. */
export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td className="py-10 text-center text-[14px] text-neutral-700" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}

/** Placeholder rows shaped like the real table while it loads. */
export function TableSkeleton({
  columns,
  rows = 6,
  label = "Loading",
}: {
  columns: number;
  rows?: number;
  label?: string;
}) {
  return (
    <div aria-busy="true" aria-label={label} role="status">
      <Table>
        <TableHeader>
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-3 w-14" />
              </TableHead>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, column) => (
                <TableCell key={column}>
                  <Skeleton className={cn("h-4", column === 0 ? "w-24" : "w-16")} />
                </TableCell>
              ))}
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
