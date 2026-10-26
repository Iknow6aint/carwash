"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError, errorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  /** What failed; usually the error itself. */
  error?: unknown;
  /** Overrides the error's message. */
  description?: string;
  /** Request ID support can search for; read from an ApiError when not given. */
  requestId?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * A section that failed to load: an ink-framed block in place of the content, with Retry and the
 * request ID.
 */
export function ErrorState({
  title = "This didn't load.",
  error,
  description,
  requestId,
  onRetry,
  className,
}: ErrorStateProps) {
  const reference = requestId ?? (error instanceof ApiError ? error.requestId : undefined);
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 border border-text px-4 py-3.5 text-[14px]",
        className,
      )}
      role="alert"
    >
      <p className="font-medium">{title}</p>
      <p className="text-[13px] text-neutral-800">
        {description ?? errorMessage(error, "Try again in a moment.")}
      </p>
      {reference ? (
        <p className="text-[12px] text-neutral-700 tabular-nums">Request ID {reference}</p>
      ) : null}
      {onRetry ? (
        <Button className="mt-1" onClick={onRetry} variant="secondary">
          <RefreshCw aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
