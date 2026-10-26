import { cn } from "@/lib/utils";

/**
 * The style guide's error block: an ink-bordered box of plain sentences, listed above the button
 * that triggered them.
 */
export function FormErrors({
  errors,
  className,
}: {
  errors: readonly string[];
  className?: string;
}) {
  if (errors.length === 0) return null;
  return (
    <div
      className={cn("flex flex-col gap-1 border border-text px-3 py-2.5 text-[13px]", className)}
      role="alert"
    >
      {errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
}
