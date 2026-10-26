import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import type { User } from "@/features/auth/schemas/auth.schema";
import { SessionProvider } from "@/providers/session-provider";

import { adminUser } from "./fixtures";

/**
 * Renders inside the desk's providers: a fresh QueryClient (no retries, so failures show at once)
 * and the session of `user` (an admin unless given).
 */
export function renderWithDesk(
  ui: ReactElement,
  { user = adminUser, ...options }: RenderOptions & { user?: User } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: 0 } },
  });
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <SessionProvider user={user}>{ui}</SessionProvider>
      </QueryClientProvider>,
      options,
    ),
  };
}
