import { cn } from "@/lib/utils";

/** A square placeholder block that pulses while content loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse bg-neutral-200", className)} />;
}
