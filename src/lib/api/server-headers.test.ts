import { describe, expect, it } from "vitest";

import { clientIpFrom, serverToServerHeaders } from "./server-headers";

describe("clientIpFrom", () => {
  it("takes the first x-forwarded-for entry", () => {
    expect(clientIpFrom(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
      "203.0.113.7",
    );
    expect(clientIpFrom(new Headers({ "x-forwarded-for": "2001:db8::1" }))).toBe("2001:db8::1");
  });

  it("falls back to x-real-ip, else nothing", () => {
    expect(clientIpFrom(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientIpFrom(new Headers())).toBeUndefined();
  });

  it("never forwards something that is not an address", () => {
    expect(
      clientIpFrom(new Headers({ "x-forwarded-for": "evil<script>", "x-real-ip": "198.51.100.4" })),
    ).toBe("198.51.100.4");
    expect(clientIpFrom(new Headers({ "x-forwarded-for": "unknown" }))).toBeUndefined();
  });
});

describe("serverToServerHeaders", () => {
  it("adds each header only when there is a value", () => {
    expect(serverToServerHeaders({ API_SECURITY_KEY: "k".repeat(32) }, "203.0.113.7")).toEqual({
      "X-Security-Key": "k".repeat(32),
      "X-Client-Ip": "203.0.113.7",
    });
    expect(serverToServerHeaders({ API_SECURITY_KEY: undefined }, undefined)).toEqual({});
  });
});
