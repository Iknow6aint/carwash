import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, Ref } from "react";

import { cn } from "@/lib/utils";

import { Corners } from "./blueprint";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-1.5 border border-transparent bg-transparent font-heading font-semibold leading-[1.2] whitespace-nowrap text-text transition-colors select-none disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  /** Solid Cartory yellow: the one filled object on a screen. */
  primary: "border-accent bg-accent text-bg hover:bg-accent-600 active:bg-accent-700",
  /** Hairline border. Destructive actions add an ink border (`className="border-text"`). */
  secondary: "border-divider hover:bg-neutral-200 active:bg-neutral-300",
  /** No border, accent text ("View all", "Sign out", "Clear"). */
  ghost: "text-accent hover:bg-accent-100 active:bg-accent-200",
};

const sizes: Record<ButtonSize, string> = {
  /** Dense table rows. */
  sm: "min-h-8 px-2.5 text-[13px]",
  md: "min-h-9 px-3 text-[14px]",
  /** The page header's "New transaction". */
  lg: "min-h-11 px-[18px] text-[16px]",
  /** Full-width 52 px submit ("Save & show receipt", "Sign in"). */
  xl: "min-h-[52px] w-full px-4 text-[17px]",
};

/**
 * Button classes, for links that look like buttons (`<Link className={buttonVariants()} />`).
 * `marks` adds the blueprint registration marks; render `<Corners />` inside the element too.
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  marks = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  marks?: boolean;
  className?: string;
} = {}) {
  return cn(
    base,
    sizes[size],
    variants[variant],
    variant === "ghost" && size !== "xl" && "px-1",
    marks && "blueprint",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Blueprint registration marks (primary buttons that lead a screen). */
  marks?: boolean;
  /** Shows a spinner, disables the button and announces it as busy. */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  className,
  type = "button",
  variant = "primary",
  size = "md",
  marks = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={loading || undefined}
      className={buttonVariants({ variant, size, marks, className })}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {marks ? <Corners /> : null}
      {loading ? (
        <Loader2 aria-hidden="true" className="size-4 animate-spin" strokeWidth={1.5} />
      ) : null}
      {children}
    </button>
  );
}
