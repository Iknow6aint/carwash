import type { InputHTMLAttributes, ReactNode, Ref } from "react";

import { cn } from "@/lib/utils";

/** Square check box (Industry `.radio` with a square dot): accent fill with a ground inset. */
export const checkboxClassName =
  "size-4 shrink-0 cursor-pointer appearance-none border-[1.5px] border-divider bg-transparent transition-colors checked:border-accent checked:bg-accent checked:shadow-[inset_0_0_0_3px_var(--bg)] hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Visible label; the whole row is then clickable. */
  label?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/** Native checkbox (keyboard and form behaviour for free) with an optional label. */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  const input = (
    <input className={cn(checkboxClassName, !label && className)} type="checkbox" {...props} />
  );
  if (!label) return input;
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-[14px] has-disabled:cursor-not-allowed has-disabled:opacity-45",
        className,
      )}
    >
      {input}
      <span>{label}</span>
    </label>
  );
}
