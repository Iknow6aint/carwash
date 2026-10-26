// @vitest-environment node
import { headers } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, errorKindForStatus } from "./api-error";
import { backendDownload, backendRequest, fileNameFromDisposition } from "./server-api-client";

// Outside a request scope (as in most of these tests) `headers()` throws, like the real one.
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => {
    throw new Error("`headers` was called outside a request scope.");
  }),
}));

const SECURITY_KEY = "test-security-key-0123456789abcdef";

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("backendRequest", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("API_INTERNAL_BASE_URL", "http://api.test/v1");
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("unwraps the success envelope and keeps the request ID", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        200,
        { status: 1, message: "Signed in", data: { ok: true } },
        { "X-Request-Id": "req-1" },
      ),
    );
    const result = await backendRequest<{ ok: boolean }>("/auth/me", { accessToken: "token" });
    expect(result).toEqual({
      response: { status: 1, message: "Signed in", data: { ok: true } },
      requestId: "req-1",
    });
  });

  it("sends the Bearer token, JSON body and Idempotency-Key to /v1", async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { status: 1, message: "Saved", data: {} }));
    await backendRequest("/transactions", {
      method: "POST",
      body: { serviceId: "s" },
      accessToken: "token-1",
      idempotencyKey: "key-1",
    });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("http://api.test/v1/transactions");
    expect(init?.method).toBe("POST");
    expect(init?.cache).toBe("no-store");
    expect(init?.body).toBe(JSON.stringify({ serviceId: "s" }));
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer token-1",
      "Idempotency-Key": "key-1",
      "Content-Type": "application/json",
    });
  });

  it("passes the API's message and errorCode through on a failure envelope", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        400,
        {
          status: 0,
          message: "Give a reason for the price change.",
          errorCode: "ADJUSTMENT_REASON_REQUIRED",
          data: null,
        },
        { "X-Request-Id": "req-2" },
      ),
    );
    const error = await backendRequest("/transactions", { method: "POST", body: {} }).catch(
      (cause: unknown) => cause,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      message: "Give a reason for the price change.",
      status: 400,
      kind: "validation",
      code: "ADJUSTMENT_REASON_REQUIRED",
      requestId: "req-2",
    });
  });

  it("treats a status-0 envelope as a failure even with HTTP 200", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { status: 0, message: "Nope", data: null }));
    await expect(backendRequest("/x")).rejects.toMatchObject({ message: "Nope", code: undefined });
  });

  it("turns a non-envelope body into a readable error", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(backendRequest("/x")).rejects.toMatchObject({ kind: "server", status: 502 });
  });

  it("reports network failures and timeouts", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(backendRequest("/x")).rejects.toMatchObject({ kind: "network", status: 0 });

    fetchMock.mockRejectedValueOnce(new DOMException("The operation timed out.", "TimeoutError"));
    await expect(backendRequest("/x")).rejects.toMatchObject({ kind: "timeout" });
  });
});

describe("server-to-server headers", () => {
  const fetchMock = vi.fn<typeof fetch>();
  const sentHeaders = () => (fetchMock.mock.calls[0]?.[1]?.headers ?? {}) as Record<string, string>;

  beforeEach(() => {
    vi.stubEnv("API_INTERNAL_BASE_URL", "http://api.test/v1");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(jsonResponse(200, { status: 1, message: "OK", data: null }));
    vi.mocked(headers).mockResolvedValueOnce(
      new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }) as Awaited<
        ReturnType<typeof headers>
      >,
    );
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends X-Security-Key and the browser's X-Client-Ip when the key is set", async () => {
    vi.stubEnv("API_SECURITY_KEY", SECURITY_KEY);
    await backendRequest("/auth/login", { method: "POST", body: {} });
    expect(sentHeaders()).toMatchObject({
      "X-Security-Key": SECURITY_KEY,
      "X-Client-Ip": "203.0.113.7",
    });
  });

  it("leaves X-Security-Key off when no key is configured", async () => {
    vi.stubEnv("API_SECURITY_KEY", "");
    await backendRequest("/auth/me", { accessToken: "t" });
    expect(sentHeaders()).not.toHaveProperty("X-Security-Key");
    expect(sentHeaders()).toMatchObject({ "X-Client-Ip": "203.0.113.7" });
  });

  it("omits X-Client-Ip outside a request scope", async () => {
    vi.mocked(headers).mockReset();
    vi.mocked(headers).mockRejectedValue(new Error("outside a request scope"));
    vi.stubEnv("API_SECURITY_KEY", SECURITY_KEY);
    await backendRequest("/auth/me", { accessToken: "t" });
    expect(sentHeaders()).not.toHaveProperty("X-Client-Ip");
    expect(sentHeaders()).toMatchObject({ "X-Security-Key": SECURITY_KEY });
  });

  it("sends both on CSV downloads too, preferring an explicit client IP", async () => {
    vi.stubEnv("API_SECURITY_KEY", SECURITY_KEY);
    fetchMock.mockResolvedValue(new Response("reference\n", { status: 200 }));
    await backendDownload("/transactions/export", { accessToken: "t", clientIp: "198.51.100.4" });
    expect(sentHeaders()).toMatchObject({
      "X-Security-Key": SECURITY_KEY,
      "X-Client-Ip": "198.51.100.4",
    });
  });
});

describe("backendDownload", () => {
  beforeEach(() => vi.stubEnv("API_INTERNAL_BASE_URL", "http://api.test/v1"));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("returns the raw CSV response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("reference,date\n", {
            status: 200,
            headers: { "Content-Type": "text/csv" },
          }),
      ),
    );
    const response = await backendDownload("/transactions/export", { accessToken: "t" });
    await expect(response.text()).resolves.toBe("reference,date\n");
  });

  it("reads the failure envelope's message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(403, {
          status: 0,
          message: "You don't have permission to do that.",
          errorCode: "FORBIDDEN",
          data: null,
        }),
      ),
    );
    await expect(backendDownload("/x", { accessToken: "t" })).rejects.toMatchObject({
      kind: "forbidden",
      code: "FORBIDDEN",
      message: "You don't have permission to do that.",
    });
  });
});

describe("helpers", () => {
  it.each([
    [400, "validation"],
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not-found"],
    [409, "conflict"],
    [429, "rate-limited"],
    [500, "server"],
    [503, "server"],
    [418, "unknown"],
  ] as const)("maps HTTP %d to %s", (status, kind) => {
    expect(errorKindForStatus(status)).toBe(kind);
  });

  it("reads a file name from Content-Disposition", () => {
    expect(fileNameFromDisposition('attachment; filename="transactions-7d.csv"')).toBe(
      "transactions-7d.csv",
    );
    expect(fileNameFromDisposition(null)).toBeUndefined();
  });
});
