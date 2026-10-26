export type ApiErrorKind =
  | "aborted"
  | "conflict"
  | "forbidden"
  | "network"
  | "not-found"
  | "rate-limited"
  | "server"
  | "timeout"
  | "unauthorized"
  | "validation"
  | "unknown";

/**
 * A failed API call, with everything the UI may show or branch on. `message` is human copy from
 * the API envelope (safe to show as is); `code` is the stable `errorCode` (branch on this, never
 * on the message); `requestId` is the `X-Request-Id` support can search for.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly kind: ApiErrorKind,
    public readonly requestId?: string,
    /** Backend `errorCode`, e.g. `ADJUSTMENT_REASON_REQUIRED`. */
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorKindForStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate-limited";
  if (status >= 500) return "server";
  return "unknown";
}

/** Copy for transport failures, where the API never answered. */
export const TRANSPORT_MESSAGES = {
  network: "Couldn't reach the Payment Desk server. Check the connection and try again.",
  timeout: "The server took too long to answer. Try again.",
  invalid: "The server sent a response the desk couldn't read. Try again.",
  shape: "The server sent data in an unexpected shape.",
  unknown: "That didn't work. Try again.",
} as const;

/** The message to show for anything thrown by a hook or service call. */
export function errorMessage(
  cause: unknown,
  fallback: string = TRANSPORT_MESSAGES.unknown,
): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}
