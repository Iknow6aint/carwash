import "server-only";

import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

import { ApiError } from "./api-error";
import type { ApiSuccess } from "./api-response";
import type { ServiceResult } from "./service-result";

interface ServicePayload<T> {
  data: T;
  message: string;
  requestId?: string;
}

interface BackendServicePayload<T> {
  response: ApiSuccess<T>;
  requestId?: string;
}

/**
 * Runs server-only service work and returns a serialisable, error-safe result.
 *
 * Server Actions must never leak exceptions or token-bearing objects to the browser, so only the
 * message, status, kind, request ID and errorCode survive.
 *
 * Do not call `redirect()` inside `operation`: it works by throwing and would be swallowed here.
 * Redirect after this returns instead.
 */
export async function executeService<T>(
  operation: () => Promise<ServicePayload<T>>,
): Promise<ServiceResult<T>> {
  try {
    const payload = await operation();
    return {
      ok: true,
      data: payload.data,
      message: payload.message,
      ...(payload.requestId ? { requestId: payload.requestId } : {}),
    };
  } catch (error) {
    // Next.js signals redirects and dynamic rendering by throwing; those must pass through.
    unstable_rethrow(error);
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: {
          kind: "validation",
          message: error.issues[0]?.message ?? "Check the details and try again.",
          status: 400,
          code: "VALIDATION_FAILED",
        },
      };
    }
    if (error instanceof ApiError) {
      return {
        ok: false,
        error: {
          kind: error.kind,
          message: error.message,
          status: error.status,
          ...(error.requestId ? { requestId: error.requestId } : {}),
          ...(error.code ? { code: error.code } : {}),
        },
      };
    }
    console.error("Unexpected service failure", error);
    return {
      ok: false,
      error: { kind: "unknown", message: "An unexpected error occurred.", status: 500 },
    };
  }
}

/** {@link executeService} for a call that returns the API envelope. */
export async function executeBackendService<T>(
  operation: () => Promise<BackendServicePayload<T>>,
): Promise<ServiceResult<T>> {
  return executeService(async () => {
    const { response, requestId } = await operation();
    return {
      data: response.data,
      message: response.message,
      ...(requestId ? { requestId } : {}),
    };
  });
}
