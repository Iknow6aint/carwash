import { ApiError, type ApiErrorKind } from "./api-error";

export interface ServiceFailure {
  ok: false;
  error: {
    kind: ApiErrorKind;
    message: string;
    status: number;
    requestId?: string;
    /** Backend `errorCode`, when the API sent one. */
    code?: string;
  };
}

export interface ServiceSuccess<T> {
  ok: true;
  data: T;
  /** The API's success message, e.g. "Business details saved". */
  message: string;
  requestId?: string;
}

/** What a `"use server"` service returns to the browser: serialisable, never a token. */
export type ServiceResult<T> = ServiceFailure | ServiceSuccess<T>;

function toApiError(result: ServiceFailure): ApiError {
  return new ApiError(
    result.error.message,
    result.error.status,
    result.error.kind,
    result.error.requestId,
    result.error.code,
  );
}

/**
 * Turns a service result into data, or throws it as an ApiError on the client side (so TanStack
 * Query sees a normal rejected promise).
 *
 * @throws ApiError with the backend message, status, kind, request ID and errorCode.
 */
export function unwrapServiceResult<T>(result: ServiceResult<T>): T {
  if (result.ok) return result.data;
  throw toApiError(result);
}

/** Like {@link unwrapServiceResult}, keeping the API's success message for a toast. */
export function unwrapServiceSuccess<T>(result: ServiceResult<T>): { data: T; message: string } {
  if (result.ok) return { data: result.data, message: result.message };
  throw toApiError(result);
}
