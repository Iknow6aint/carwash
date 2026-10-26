import "server-only";

import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";

import { getServerEnv } from "@/config/env";

import { ApiError, errorKindForStatus, TRANSPORT_MESSAGES } from "./api-error";
import { isApiEnvelope, type ApiSuccess } from "./api-response";
import { clientIpFrom, serverToServerHeaders } from "./server-headers";

const DEFAULT_TIMEOUT_MS = 15_000;

export interface BackendRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  /** JSON body; serialised here. */
  body?: unknown;
  /** Bearer token. Pass it only from `authenticatedBackendRequest` or the auth services. */
  accessToken?: string;
  /** Sent as `Idempotency-Key` (required by `POST /transactions`). */
  idempotencyKey?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  /**
   * The browser's IP, sent as `X-Client-Ip`. Read from the incoming request when omitted; Route
   * Handlers may pass it from `request.headers`.
   */
  clientIp?: string;
}

/**
 * The browser's IP for the request being handled, or `undefined` outside a request scope (tests,
 * scripts), where `headers()` throws.
 */
async function incomingClientIp(): Promise<string | undefined> {
  try {
    return clientIpFrom(await headers());
  } catch (error) {
    unstable_rethrow(error);
    return undefined;
  }
}

/** `X-Security-Key` and `X-Client-Ip` for one call (README "Server-to-server headers"). */
async function securityHeaders(
  environment: ReturnType<typeof getServerEnv>,
  clientIp: string | undefined,
): Promise<Record<string, string>> {
  return serverToServerHeaders(environment, clientIp ?? (await incomingClientIp()));
}

export interface BackendPayload<T> {
  response: ApiSuccess<T>;
  requestId?: string;
}

/**
 * Calls the NestJS API and unwraps the `{ status, message, data }` envelope.
 *
 * Runs only on the server: the access token comes from an HttpOnly cookie and never reaches the
 * browser. Every call is uncached (`no-store`), times out after 15 s, and carries
 * `X-Security-Key` (when configured) and the browser's `X-Client-Ip`.
 *
 * @param route - Path from `API_ROUTES` (with any query string), relative to `/v1`.
 * @param options - Method, JSON body, token, idempotency key and timeout.
 * @returns The success envelope and the `X-Request-Id`.
 * @throws ApiError on a failure envelope, a non-2xx status, an unreadable body, a timeout or a
 * network failure. The API's `message` and `errorCode` pass through unchanged.
 */
export async function backendRequest<T>(
  route: string,
  {
    method = "GET",
    body,
    accessToken,
    idempotencyKey,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    clientIp,
  }: BackendRequestOptions = {},
): Promise<BackendPayload<T>> {
  const environment = getServerEnv();
  const extraHeaders = await securityHeaders(environment, clientIp);
  const timeout = AbortSignal.timeout(timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${environment.API_INTERNAL_BASE_URL}${route}`, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        ...extraHeaders,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    unstable_rethrow(error);
    throw transportError(error, signal);
  }

  const requestId = response.headers.get("x-request-id") ?? undefined;
  const payload: unknown = await response.json().catch(() => null);

  if (!isApiEnvelope(payload)) {
    throw new ApiError(
      TRANSPORT_MESSAGES.invalid,
      response.status,
      response.ok ? "server" : errorKindForStatus(response.status),
      requestId,
    );
  }
  if (!response.ok || payload.status === 0) {
    const code = "errorCode" in payload ? payload.errorCode : undefined;
    throw new ApiError(
      payload.message,
      response.status,
      errorKindForStatus(response.status),
      requestId,
      typeof code === "string" ? code : undefined,
    );
  }
  return { response: payload as ApiSuccess<T>, ...(requestId ? { requestId } : {}) };
}

/**
 * Opens a raw (non-envelope) download such as a CSV export. CSV routes answer with the file on
 * success but still use the JSON envelope for failures.
 *
 * @returns The upstream response, already checked to be 2xx with a body.
 * @throws ApiError with the API's message when the export fails.
 */
export async function backendDownload(
  route: string,
  {
    accessToken,
    signal,
    timeoutMs = 60_000,
    clientIp,
  }: Pick<BackendRequestOptions, "accessToken" | "signal" | "timeoutMs" | "clientIp">,
): Promise<Response> {
  const environment = getServerEnv();
  const extraHeaders = await securityHeaders(environment, clientIp);
  const timeout = AbortSignal.timeout(timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${environment.API_INTERNAL_BASE_URL}${route}`, {
      cache: "no-store",
      headers: {
        Accept: "text/csv, application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...extraHeaders,
      },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    unstable_rethrow(error);
    throw transportError(error, signal);
  }

  const requestId = response.headers.get("x-request-id") ?? undefined;
  if (!response.ok || !response.body) {
    const payload: unknown = await response.json().catch(() => null);
    const code = isApiEnvelope(payload) && "errorCode" in payload ? payload.errorCode : undefined;
    throw new ApiError(
      isApiEnvelope(payload) ? payload.message : "The export couldn't be downloaded. Try again.",
      response.ok ? 502 : response.status,
      response.ok ? "server" : errorKindForStatus(response.status),
      requestId,
      typeof code === "string" ? code : undefined,
    );
  }
  return response;
}

function transportError(error: unknown, signal: AbortSignal | undefined): ApiError {
  if (signal?.aborted) return new ApiError("The request was cancelled.", 0, "aborted");
  if (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return new ApiError(TRANSPORT_MESSAGES.timeout, 0, "timeout");
  }
  return new ApiError(TRANSPORT_MESSAGES.network, 0, "network");
}

/** Reads `filename="..."` from a Content-Disposition header. */
export function fileNameFromDisposition(header: string | null): string | undefined {
  if (!header) return undefined;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1]?.trim() || undefined;
}
