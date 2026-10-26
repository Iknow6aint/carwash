"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Corners } from "./blueprint";

/**
 * Radix dialog parts. `DialogContent` is a blueprint object on the page ground, centred over a
 * dimmed backdrop that scrolls when the dialog is taller than the screen. It always has a title
 * (visible or not) so screen readers announce what opened. Esc and a backdrop click close it.
 *
 * @example
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogContent title="Reset password">...</DialogContent>
 * </Dialog>
 */
export const Dialog = DialogPrimitive.Root;

interface DialogContentProps extends Omit<ComponentProps<typeof DialogPrimitive.Content>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Keep the title for screen readers only (the receipt shows its own header). */
  hideTitle?: boolean;
  /** Width; the receipt is 400 px. */
  size?: "sm" | "md";
  /** Extra attributes for the backdrop (the receipt marks it for printing). */
  overlayProps?: ComponentProps<typeof DialogPrimitive.Overlay> & Record<`data-${string}`, string>;
}

const widths = { sm: "w-[min(400px,100%)]", md: "w-[min(480px,100%)]" } as const;

export function DialogContent({
  title,
  description,
  hideTitle = false,
  size = "md",
  overlayProps,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        {...overlayProps}
        className={cn(
          "fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-bg/80 p-4 backdrop-blur-[2px] sm:p-6",
          overlayProps?.className,
        )}
      >
        <DialogPrimitive.Content
          className={cn(
            "blueprint relative my-auto flex flex-col gap-3.5 border border-divider bg-bg p-3.5 shadow-lg focus-visible:outline-none",
            widths[size],
            className,
          )}
          {...(description ? {} : { "aria-describedby": undefined })}
          {...props}
        >
          <Corners />
          <DialogPrimitive.Title
            className={cn(
              "font-heading text-[22px] leading-tight font-semibold",
              hideTitle && "sr-only",
            )}
          >
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="-mt-2 text-[14px] text-neutral-700">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

/** Actions row: least destructive first, main action last (right). Wraps on phones. */
export function DialogActions({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap justify-end gap-2", className)} {...props} />;
}
