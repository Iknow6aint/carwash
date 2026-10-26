// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authSession } from "@/testing/fixtures";
import { tokenExpiringAt } from "@/testing/tokens";

import { proxy } from "./proxy";

function request(
  path: string,
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {},
) {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return new NextRequest(new URL(path, "http://desk.test"), {
    headers: { ...(cookie ? { cookie } : {}), ...headers },
  });
}

const fresh = () => tokenExpiringAt(Date.now() + 10 * 60_000);
const renewed = () => ({
  ...authSession,
  accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
});
const expiring = () => tokenExpiringAt(Date.now() + 20_000);

describe("proxy", () => {
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

  it("sends a protected page without a session to /login?returnTo=", async () => {
    const response = await proxy(request("/transactions?range=7d"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://desk.test/login?returnTo=%2Ftransactions%3Frange%3D7d",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets a fresh session through and tells the page which path was asked for", async () => {
    const response = await proxy(request("/dashboard", { cw_access: fresh() }));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-middleware-request-x-desk-path")).toBe("/dashboard");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renews a token that expires within 60 s and sets both HttpOnly cookies", async () => {
    fetchMock.mockResolvedValue(Response.json({ status: 1, message: "OK", data: renewed() }));
    const response = await proxy(
      request("/new", { cw_access: expiring(), cw_refresh: "refresh-renew" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://api.test/v1/auth/refresh");
    const access = response.cookies.get("cw_access");
    expect(access?.value).toBe(authSession.accessToken);
    expect(access).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    // cw_access lives exactly as long as the access token (15 min here).
    expect(access?.maxAge).toBeGreaterThan(890);
    expect(access?.maxAge).toBeLessThanOrEqual(900);
    expect(response.cookies.get("cw_refresh")).toMatchObject({
      value: authSession.refreshToken,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
    });
    // The page rendering after the proxy sees the new token too.
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      `cw_access=${authSession.accessToken}`,
    );
  });

  it("sends X-Security-Key and the browser's X-Client-Ip with the refresh", async () => {
    vi.stubEnv("API_SECURITY_KEY", "test-security-key-0123456789abcdef");
    fetchMock.mockResolvedValue(Response.json({ status: 1, message: "OK", data: renewed() }));
    await proxy(
      request(
        "/new",
        { cw_refresh: "refresh-headers" },
        { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
      ),
    );
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "X-Security-Key": "test-security-key-0123456789abcdef",
      "X-Client-Ip": "203.0.113.7",
    });
  });

  it("shares one refresh between parallel requests with the same refresh token", async () => {
    fetchMock.mockResolvedValue(Response.json({ status: 1, message: "OK", data: authSession }));
    const cookies = { cw_refresh: "refresh-parallel" };
    await Promise.all([proxy(request("/new", cookies)), proxy(request("/dashboard", cookies))]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends the browser to sign in when the refresh token is rejected", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          status: 0,
          message: "Your session has ended. Sign in again.",
          errorCode: "INVALID_REFRESH_TOKEN",
          data: null,
        },
        { status: 401 },
      ),
    );
    const response = await proxy(request("/reports", { cw_refresh: "refresh-dead" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://desk.test/login?returnTo=%2Freports");
  });

  it("renders the sign-in page for signed-out visitors", async () => {
    const response = await proxy(request("/login?returnTo=%2Fnew"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("never redirects a Server Action call: the service answers unauthorized instead", async () => {
    const response = await proxy(request("/transactions", {}, { "next-action": "abc123" }));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
