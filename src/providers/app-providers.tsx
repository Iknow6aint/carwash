"use client";

import type { PropsWithChildren } from "react";

import { Toaster } from "@/components/ui/toast";

import { QueryProvider } from "./query-provider";

/** Providers every page needs. The session provider sits lower, in the (desk) layout. */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
