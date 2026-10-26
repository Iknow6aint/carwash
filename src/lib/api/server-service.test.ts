import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { ApiError } from "./api-error";
import { mapBackendData } from "./backend-data";
import { executeBackendService, executeService } from "./server-service";
import { unwrapServiceResult, unwrapServiceSuccess } from "./service-result";

const envelope = (data: unknown) => ({
  response: { status: 1 as const, message: "OK", data },
  requestId: "req-9",
});

describe("executeBackendService", () => {
  it("returns a serialisable success with the API message and request ID", async () => {
    await expect(executeBackendService(async () => envelope({ id: 1 }))).resolves.toEqual({
      ok: true,
      data: { id: 1 },
      message: "OK",
      requestId: "req-9",
    });
  });

  it("keeps an ApiError's kind, status, request ID and errorCode", async () => {
    const result = await executeBackendService(async () => {
      throw new ApiError(
        "There must always be at least one active admin.",
        409,
        "conflict",
        "req-3",
        "LAST_ADMIN",
      );
    });
    expect(result).toEqual({
      ok: false,
      error: {
        kind: "conflict",
        message: "There must always be at least one active admin.",
        status: 409,
        requestId: "req-3",
        code: "LAST_ADMIN",
      },
    });
  });

  it("turns an input ZodError into a validation failure with the first message", async () => {
    const result = await executeService(async () => {
      z.object({
        reason: z.string().min(1, "A reason is required. It stays on the record."),
      }).parse({ reason: "" });
      return { data: null, message: "" };
    });
    expect(result).toMatchObject({
      ok: false,
      error: {
        kind: "validation",
        status: 400,
        message: "A reason is required. It stays on the record.",
      },
    });
  });

  it("never leaks unknown errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await executeService(async () => {
      throw new Error("secret token abc");
    });
    expect(result).toEqual({
      ok: false,
      error: { kind: "unknown", message: "An unexpected error occurred.", status: 500 },
    });
    spy.mockRestore();
  });
});

describe("mapBackendData", () => {
  const schema = z.object({ count: z.number() });

  it("parses the data with the feature schema", async () => {
    const result = await mapBackendData(Promise.resolve(envelope({ count: 3 })), (data) =>
      schema.parse(data),
    );
    expect(result.response.data).toEqual({ count: 3 });
  });

  it("turns a contract mismatch into a 502 server error with the request ID", async () => {
    const error = await mapBackendData(Promise.resolve(envelope({ count: "3" })), (data) =>
      schema.parse(data),
    ).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "server", status: 502, requestId: "req-9" });
  });
});

describe("unwrapServiceResult", () => {
  it("returns data, or the message too", () => {
    expect(unwrapServiceResult({ ok: true, data: 1, message: "Saved" })).toBe(1);
    expect(unwrapServiceSuccess({ ok: true, data: 1, message: "Saved" })).toEqual({
      data: 1,
      message: "Saved",
    });
  });

  it("rebuilds the ApiError on the client, errorCode included", () => {
    let caught: unknown;
    try {
      unwrapServiceResult({
        ok: false,
        error: {
          kind: "conflict",
          message: "Taken",
          status: 409,
          requestId: "r",
          code: "SERVICE_NAME_TAKEN",
        },
      });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({
      kind: "conflict",
      code: "SERVICE_NAME_TAKEN",
      requestId: "r",
      status: 409,
    });
  });
});
