import { describe, expect, it } from "vitest";

import {
  buildDemoMessage,
  buildWhatsAppUrl,
  demoWhatsAppUrl,
  parseDemoRequest,
  type DemoRequestInput,
} from "./demo-request";

const valid: DemoRequestInput = {
  name: "Ada",
  business: "Splash Point Car Wash",
  phone: "0803 000 0000",
  bays: "3–5",
};

describe("parseDemoRequest", () => {
  it("asks for both names first, then a callable phone", () => {
    expect(parseDemoRequest({ ...valid, name: "  ", phone: "" })).toEqual({
      ok: false,
      error: "Add your name and your car wash name.",
    });
    expect(parseDemoRequest({ ...valid, business: "" })).toEqual({
      ok: false,
      error: "Add your name and your car wash name.",
    });
    expect(parseDemoRequest({ ...valid, phone: "0803 000 00" })).toEqual({
      ok: false,
      error: "Enter a phone number we can call.",
    });
  });

  it("accepts 10+ digits in any format and trims the text", () => {
    const result = parseDemoRequest({ ...valid, name: " Ada ", phone: "+234 (803) 000-0000" });
    expect(result).toEqual({
      ok: true,
      data: { ...valid, name: "Ada", phone: "+234 (803) 000-0000" },
    });
  });
});

describe("WhatsApp handoff", () => {
  const request = { ...valid, bays: "3–5" as const };

  it("writes the message the design's form collects", () => {
    expect(buildDemoMessage(request)).toBe(
      [
        "Hello Cartory Wash, I'd like a demo.",
        "Name: Ada",
        "Car wash: Splash Point Car Wash",
        "Phone: 0803 000 0000",
        "Wash bays: 3–5",
      ].join("\n"),
    );
  });

  it("builds a wa.me link with the message URL-encoded", () => {
    expect(buildWhatsAppUrl("2348030000000", "Hi there,\nName: Ada & co")).toBe(
      "https://wa.me/2348030000000?text=Hi%20there%2C%0AName%3A%20Ada%20%26%20co",
    );
    const url = new URL(demoWhatsAppUrl("2348030000000", request));
    expect(url.origin + url.pathname).toBe("https://wa.me/2348030000000");
    expect(url.searchParams.get("text")).toBe(buildDemoMessage(request));
  });
});
