"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Menu of row actions (Radix: keyboard navigation, focus return, typeahead). Use it for actions,
 * never for form values (use the native Select).
 */
export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        className={cn("z-50 min-w-48 border border-divider bg-surface p-1 shadow-md", className)}
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        "flex min-h-9 cursor-pointer items-center px-2.5 text-[14px] outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-45 data-highlighted:bg-accent-100 data-highlighted:text-accent-900",
        className,
      )}
      {...props}
    />
  );
}
