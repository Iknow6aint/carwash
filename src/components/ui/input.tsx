import type { InputHTMLAttributes, Ref } from "react";

import { cn } from "@/lib/utils";

/**
 * The Industry `.input` look shared by inputs and selects: square, surface fill, hairline border,
 * accent caret and focus edge, an ink edge when invalid.
 */
export const controlClassName =
  "w-full min-h-9 border border-divider bg-surface px-2.5 py-1.5 text-[14px] leading-normal text-text caret-accent transition-colors placeholder:text-neutral-600 hover:border-neutral-600 focus-visible:border-accent focus-visible:outline-offset-0 aria-invalid:border-text disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-divider";

/** Cashier-facing size: 44 px tall with 16 px text (tablets; also stops iOS zooming). */
export const largeControlClassName = "min-h-11 text-[16px]";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** `lg` for cashier-facing inputs. */
  inputSize?: "md" | "lg";
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, inputSize = "md", type = "text", ...props }: InputProps) {
  return (
    <input
      className={cn(controlClassName, inputSize === "lg" && largeControlClassName, className)}
      type={type}
      {...props}
    />
  );
}
