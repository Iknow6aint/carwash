"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toasts confirm success only ("Saved CW-261019-025 · dashboard updated"). Errors stay next to
 * the control that caused them. Call `toast(message)` from this module.
 */
export { toast } from "sonner";

/** Style-guide toast: accent-900 field, ground-coloured text, bottom-right, 2.6 s. */
export function Toaster() {
  return (
    <SonnerToaster
      duration={2600}
      gap={8}
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-2 bg-accent-900 px-4 py-3 font-body text-[14px] text-bg shadow-lg sm:w-auto sm:max-w-[420px]",
        },
      }}
    />
  );
}
