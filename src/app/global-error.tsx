"use client";

import { ErrorState } from "@/components/feedback/error-state";

import "./globals.css";

/** Replaces the root layout when it fails; renders its own document. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;
  return (
    <html lang="en-NG">
      <body className="flex min-h-dvh items-center justify-center p-6">
        <title>Payment desk unavailable</title>
        <div className="w-full max-w-xl">
          <ErrorState
            description="The payment desk hit an unexpected error. Try again in a moment."
            onRetry={retry}
            requestId={digest}
            title="The desk couldn't load."
          />
        </div>
      </body>
    </html>
  );
}
