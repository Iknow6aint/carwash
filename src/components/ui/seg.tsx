"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

export interface SegOption<T extends string> {
  value: T;
  label: string;
}

interface SegProps<T extends string> {
  /** Accessible name of the group, e.g. "Period". */
  label: string;
  options: readonly SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Segmented control for time ranges (Industry `.seg`). Built on native radios that share a name,
 * so Tab enters the group and the arrow keys move the selection.
 */
export function Seg<T extends string>({ label, options, value, onChange, className }: SegProps<T>) {
  const name = useId();
  return (
    <div
      aria-label={label}
      className={cn("inline-flex max-w-full flex-wrap border border-divider", className)}
      role="radiogroup"
    >
      {options.map((option) => (
        <label
          className={cn(
            "relative inline-flex min-h-9 cursor-pointer items-center px-3 py-[7px] text-[13px] whitespace-nowrap transition-colors not-first:border-l not-first:border-divider",
            "hover:bg-neutral-200 has-checked:bg-accent has-checked:text-bg has-checked:hover:bg-accent",
            "has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-accent",
          )}
          key={option.value}
        >
          <input
            checked={option.value === value}
            className="pointer-events-none absolute size-0 opacity-0"
            name={name}
            onChange={() => onChange(option.value)}
            type="radio"
            value={option.value}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
