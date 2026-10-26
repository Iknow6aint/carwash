/** The API's JSON envelope (carwash-api/docs/api/README.md). */
export interface ApiSuccess<T> {
  status: 1;
  message: string;
  data: T;
}

export interface ApiFailure {
  status: 0;
  message: string;
  /** Present only for known, stable errors. */
  errorCode?: string;
  data: unknown;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.status === 0 || candidate.status === 1) &&
    typeof candidate.message === "string" &&
    "data" in candidate
  );
}
