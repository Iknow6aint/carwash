"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** An on/off setting (square track, square thumb), announced as a switch. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  const labelId = useId();
  const descriptionId = useId();
  return (
    <div className={cn("flex items-start gap-3", disabled && "opacity-45", className)}>
      <button
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={labelId}
        className={cn(
          "relative mt-0.5 inline-flex h-[22px] w-10 shrink-0 items-center border transition-colors disabled:cursor-not-allowed",
          checked ? "border-accent bg-accent-100" : "border-divider bg-transparent",
        )}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-[3px] size-3.5 transition-transform",
            checked ? "translate-x-[21px] bg-accent" : "translate-x-[3px] bg-neutral-600",
          )}
        />
      </button>
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px]" id={labelId}>
          {label}
        </span>
        {description ? (
          <span className="text-[12px] text-neutral-700" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
