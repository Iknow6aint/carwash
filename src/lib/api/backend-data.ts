import { z } from "zod";

import { ApiError, TRANSPORT_MESSAGES } from "./api-error";
import type { ApiSuccess } from "./api-response";

interface BackendPayload<T> {
  response: ApiSuccess<T>;
  requestId?: string;
}

/**
 * Validates backend data at the service boundary with the feature's Zod schema.
 *
 * A response that does not match the contract becomes a 502 server error carrying the request
 * ID, instead of a misleading form-validation message.
 *
 * @param request - Pending backend request.
 * @param parse - Schema parse that throws a ZodError on an unexpected shape.
 * @returns The same envelope with parsed data.
 * @throws ApiError when the payload does not parse, or the request's own ApiError.
 */
export async function mapBackendData<T>(
  request: Promise<BackendPayload<unknown>>,
  parse: (data: unknown) => T,
): Promise<BackendPayload<T>> {
  const { response, requestId } = await request;
  try {
    return {
      response: { ...response, data: parse(response.data) },
      ...(requestId ? { requestId } : {}),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(TRANSPORT_MESSAGES.shape, 502, "server", requestId);
    }
    throw error;
  }
}
