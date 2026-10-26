"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { getQueryClient } from "@/lib/api/query-client";

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
