import { ChevronDown } from "lucide-react";
import type { Ref, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { controlClassName, largeControlClassName } from "./input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  inputSize?: "md" | "lg";
  /** Classes for the wrapper, e.g. `w-auto` in a filter bar. */
  wrapperClassName?: string;
  ref?: Ref<HTMLSelectElement>;
}

/**
 * Native select in the input style. Native keeps keyboard, screen-reader and tablet pickers
 * working with no extra code.
 */
export function Select({
  className,
  wrapperClassName,
  inputSize = "md",
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        className={cn(
          controlClassName,
          inputSize === "lg" && largeControlClassName,
          "appearance-none pr-8",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-neutral-700"
        strokeWidth={1.5}
      />
    </div>
  );
}
