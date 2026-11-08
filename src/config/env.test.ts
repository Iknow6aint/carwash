// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { getServerEnv } from "./env";

describe("getServerEnv", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("requires the /v1 prefix and trims a trailing slash", () => {
    vi.stubEnv("API_INTERNAL_BASE_URL", "https://api.example/v1/");
    expect(getServerEnv().API_INTERNAL_BASE_URL).toBe("https://api.example/v1");
    vi.stubEnv("API_INTERNAL_BASE_URL", "https://api.example");
    expect(() => getServerEnv()).toThrow(/\/v1/);
  });

  it("treats API_SECURITY_KEY as optional, but at least 32 characters when set", () => {
    vi.stubEnv("API_SECURITY_KEY", "");
    expect(getServerEnv().API_SECURITY_KEY).toBeUndefined();
    vi.stubEnv("API_SECURITY_KEY", "x".repeat(32));
    expect(getServerEnv().API_SECURITY_KEY).toBe("x".repeat(32));
    vi.stubEnv("API_SECURITY_KEY", "too-short");
    expect(() => getServerEnv()).toThrow(/at least 32 characters/);
  });
});

describe("publicEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const loadPublicEnv = async () => {
    vi.resetModules();
    return (await import("./env")).publicEnv;
  };

  it("treats NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER as optional, but 10–15 digits when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER", "");
    expect((await loadPublicEnv()).NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER).toBeUndefined();

    vi.stubEnv("NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER", " 2348030000000 ");
    expect((await loadPublicEnv()).NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER).toBe("2348030000000");

    vi.stubEnv("NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER", "+234 803 000 0000");
    await expect(loadPublicEnv()).rejects.toThrow(/10–15 digits/);
    vi.stubEnv("NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER", "080300");
    await expect(loadPublicEnv()).rejects.toThrow(/10–15 digits/);
  });
});
