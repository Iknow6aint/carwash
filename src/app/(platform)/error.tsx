"use client";

import { ErrorState } from "@/components/feedback/error-state";

/** A platform page that failed to render (for example the API was down when it loaded). */
export default function PlatformError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;
  return (
    <ErrorState
      description="The page couldn't load. Check the connection and try again."
      onRetry={retry}
      requestId={digest}
      title="This page didn't load."
    />
  );
}
