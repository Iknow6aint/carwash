import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TagTone = "accent" | "neutral" | "outline";

const tones: Record<TagTone, string> = {
  /** Paid, Active, Admin. */
  accent: "bg-accent-100 text-accent-800",
  /** Cancelled, Inactive, Cashier. */
  neutral: "bg-neutral-100 text-neutral-800",
  /** Adjusted (sits beside Paid). */
  outline: "border border-accent text-accent",
};

/** Small status / role label. Status is carried by tag style and words, never extra colours. */
export function Tag({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: TagTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-[3px] text-[11px] leading-[1.3] tracking-[0.02em] whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
