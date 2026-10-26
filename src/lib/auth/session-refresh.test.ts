// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authSession } from "@/testing/fixtures";
import { tokenExpiringAt } from "@/testing/tokens";

import {
  ACCESS_TOKEN_SKEW_MS,
  REJECTED_TOKEN_MS,
  ROTATION_REUSE_MS,
  accessTokenExpiry,
  createRefreshCoordinator,
  decideProxyAction,
  isAccessTokenFresh,
  requestRefresh,
  type RefreshOutcome,
} from "./session-refresh";

const NOW = 1_800_000_000_000;

describe("accessTokenExpiry", () => {
  it("reads exp in milliseconds", () => {
    expect(accessTokenExpiry(tokenExpiringAt(NOW + 900_000))).toBe(NOW + 900_000);
  });

  it.each(["", "abc", "a.!!!.c", `a.${btoa("{}")}.c`, `a.${btoa('{"exp":"soon"}')}.c`])(
    "returns null for %j",
    (value) => {
      expect(accessTokenExpiry(value)).toBeNull();
    },
  );
});

describe("isAccessTokenFresh", () => {
  it("renews 60 s before expiry", () => {
    expect(isAccessTokenFresh(tokenExpiringAt(NOW + 10 * 60_000), NOW)).toBe(true);
    expect(isAccessTokenFresh(tokenExpiringAt(NOW + ACCESS_TOKEN_SKEW_MS + 1_000), NOW)).toBe(true);
    expect(isAccessTokenFresh(tokenExpiringAt(NOW + ACCESS_TOKEN_SKEW_MS - 1_000), NOW)).toBe(
      false,
    );
    expect(isAccessTokenFresh(tokenExpiringAt(NOW - 1), NOW)).toBe(false);
    expect(isAccessTokenFresh(undefined, NOW)).toBe(false);
    expect(isAccessTokenFresh("not-a-jwt", NOW)).toBe(false);
  });
});

describe("decideProxyAction", () => {
  const fresh = tokenExpiringAt(NOW + 10 * 60_000);
  const expiring = tokenExpiringAt(NOW + 30_000);

  it("lets a fresh session through", () => {
    expect(
      decideProxyAction({ route: "protected", accessToken: fresh, refreshToken: "r", now: NOW }),
    ).toBe("continue");
  });

  it("refreshes an expiring or missing access token when a refresh cookie exists", () => {
    expect(
      decideProxyAction({ route: "protected", accessToken: expiring, refreshToken: "r", now: NOW }),
    ).toBe("refresh");
    expect(decideProxyAction({ route: "protected", refreshToken: "r", now: NOW })).toBe("refresh");
    expect(decideProxyAction({ route: "login", refreshToken: "r", now: NOW })).toBe("refresh");
  });

  it("sends protected pages to sign in without a session, but renders the sign-in page", () => {
    expect(decideProxyAction({ route: "protected", now: NOW })).toBe("login");
    expect(decideProxyAction({ route: "protected", accessToken: expiring, now: NOW })).toBe(
      "login",
    );
    expect(decideProxyAction({ route: "login", now: NOW })).toBe("continue");
  });
});

describe("createRefreshCoordinator", () => {
  const pair: RefreshOutcome = {
    ok: true,
    tokens: {
      accessToken: "a-2",
      accessTokenExpiresAt: "2026-10-19T09:30:00.000Z",
      refreshToken: "r-2",
    },
  };

  function setup(outcome: RefreshOutcome | Error = pair) {
    let now = NOW;
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const refresh = vi.fn(async () => {
      await gate;
      if (outcome instanceof Error) throw outcome;
      return outcome;
    });
    const rotate = createRefreshCoordinator({ refresh, now: () => now });
    return { refresh, rotate, release, advance: (ms: number) => (now += ms) };
  }

  it("rotates once for concurrent requests carrying the same token (single flight)", async () => {
    const { refresh, rotate, release } = setup();
    const results = Promise.all([rotate("r-1"), rotate("r-1"), rotate("r-1")]);
    release();
    await expect(results).resolves.toEqual([pair, pair, pair]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("hands a just-rotated token the same new pair within the reuse window", async () => {
    const { refresh, rotate, release, advance } = setup();
    release();
    await rotate("r-1");
    advance(ROTATION_REUSE_MS - 1);
    await expect(rotate("r-1")).resolves.toEqual(pair);
    expect(refresh).toHaveBeenCalledTimes(1);
    advance(2);
    await rotate("r-1");
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("keeps different tokens apart", async () => {
    const { refresh, rotate, release } = setup();
    release();
    await Promise.all([rotate("a"), rotate("b")]);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("remembers a rejected token for a while", async () => {
    const { refresh, rotate, release, advance } = setup({ ok: false, reason: "rejected" });
    release();
    await rotate("dead");
    await rotate("dead");
    expect(refresh).toHaveBeenCalledTimes(1);
    advance(REJECTED_TOKEN_MS + 1);
    await rotate("dead");
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("retries at once after the API was unreachable, and never throws", async () => {
    const { refresh, rotate, release } = setup(new Error("socket hang up"));
    release();
    await expect(rotate("r")).resolves.toEqual({ ok: false, reason: "unavailable" });
    await rotate("r");
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});

describe("requestRefresh", () => {
  beforeEach(() => vi.stubEnv("API_INTERNAL_BASE_URL", "http://api.test/v1"));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  function stubFetch(status: number, body: unknown) {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("posts { refreshToken } to /v1/auth/refresh and reads the new pair", async () => {
    const fetchMock = stubFetch(200, { status: 1, message: "OK", data: authSession });
    await expect(requestRefresh("r-1")).resolves.toEqual({
      ok: true,
      tokens: {
        accessToken: authSession.accessToken,
        accessTokenExpiresAt: authSession.accessTokenExpiresAt,
        refreshToken: authSession.refreshToken,
      },
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://api.test/v1/auth/refresh");
    expect(JSON.parse(String(init.body))).toEqual({ refreshToken: "r-1" });
  });

  it("treats a 401 as rejected and 429 / 5xx / a malformed body as unavailable", async () => {
    stubFetch(401, {
      status: 0,
      message: "Your session has ended. Sign in again.",
      errorCode: "INVALID_REFRESH_TOKEN",
      data: null,
    });
    await expect(requestRefresh("r")).resolves.toEqual({ ok: false, reason: "rejected" });
    stubFetch(429, { status: 0, message: "Too many attempts.", data: null });
    await expect(requestRefresh("r")).resolves.toEqual({ ok: false, reason: "unavailable" });
    stubFetch(503, { status: 0, message: "Down", data: null });
    await expect(requestRefresh("r")).resolves.toEqual({ ok: false, reason: "unavailable" });
    stubFetch(200, { status: 1, message: "OK", data: { accessToken: "only-half" } });
    await expect(requestRefresh("r")).resolves.toEqual({ ok: false, reason: "unavailable" });
  });

  it("never throws when the API cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    await expect(requestRefresh("r")).resolves.toEqual({ ok: false, reason: "unavailable" });
  });
});
