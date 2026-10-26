"use client";

import { ErrorState } from "@/components/feedback/error-state";

/**
 * Catches failures above the desk shell, e.g. `GET /auth/me` failing because the API is down
 * (signed-out users are redirected to sign in instead).
 */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <ErrorState
          description="The payment desk couldn't reach its server. Check the connection and try again."
          onRetry={retry}
          requestId={digest}
          title="The desk couldn't load."
        />
      </div>
    </main>
  );
}
