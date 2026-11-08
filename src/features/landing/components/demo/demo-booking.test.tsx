import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicEnv } from "@/config/env";

import { DemoBooking } from "./demo-booking";

const env = vi.hoisted(() => ({
  publicEnv: {
    NEXT_PUBLIC_APP_NAME: "Cartory Wash",
    NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER: "2348030000000",
  } as PublicEnv,
}));
vi.mock("@/config/env", () => env);

const message = [
  "Hello Cartory Wash, I'd like a demo.",
  "Name: Ada",
  "Car wash: Splash Point Car Wash",
  "Phone: 0803 000 0000",
  "Wash bays: 3–5",
].join("\n");
const whatsAppUrl = `https://wa.me/2348030000000?text=${encodeURIComponent(message)}`;

describe("DemoBooking", () => {
  const open = vi.fn<typeof window.open>();

  beforeEach(() => {
    env.publicEnv.NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER = "2348030000000";
    open.mockReset().mockReturnValue(null);
    vi.stubGlobal("open", open);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("shows the design's errors above the button, names before phone", async () => {
    const user = userEvent.setup();
    render(<DemoBooking />);
    const submit = screen.getByRole("button", { name: "Request a demo" });

    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent("Add your name and your car wash name.");

    await user.type(screen.getByLabelText("Your name"), "Ada");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Car wash name"), "Splash Point Car Wash");
    await user.type(screen.getByLabelText("Phone or WhatsApp"), "0803 000 00");
    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a phone number we can call.");
    expect(open).not.toHaveBeenCalled();
  });

  it("opens WhatsApp with the request typed in, then says how to finish booking", async () => {
    const user = userEvent.setup();
    render(<DemoBooking />);

    await user.type(screen.getByLabelText("Your name"), "Ada");
    await user.type(screen.getByLabelText("Car wash name"), "Splash Point Car Wash");
    await user.type(screen.getByLabelText("Phone or WhatsApp"), "0803 000 0000");
    expect(screen.getByRole("radio", { name: "1–2" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "3–5" }));
    await user.click(screen.getByRole("button", { name: "Request a demo" }));

    expect(open).toHaveBeenCalledWith(whatsAppUrl, "_blank", "noopener,noreferrer");
    expect(screen.getByText("Almost done")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thanks, Ada." })).toHaveFocus();
    expect(
      screen.getByText(
        "Send the WhatsApp message we just opened to finish booking. We'll call 0803 000 0000 within one working day to set a time for Splash Point Car Wash.",
      ),
    ).toBeInTheDocument();
    const again = screen.getByRole("link", { name: "Open WhatsApp again" });
    expect(again).toHaveAttribute("href", whatsAppUrl);
    expect(again).toHaveAttribute("target", "_blank");
    expect(again).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Try the payment desk now" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByRole("button", { name: "Request a demo" })).not.toBeInTheDocument();
  });

  it("shows no form when no WhatsApp number is configured", () => {
    env.publicEnv.NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER = undefined;
    render(<DemoBooking />);

    expect(screen.getByRole("heading", { name: "Book a demo" })).toBeInTheDocument();
    expect(screen.getByText("Demo booking opens soon.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
