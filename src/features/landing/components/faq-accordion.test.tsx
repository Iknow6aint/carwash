import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FAQS } from "../utils/content";

import { FaqAccordion } from "./faq-accordion";

const question = (name: string) => screen.getByRole("button", { name });
const expanded = () =>
  screen
    .getAllByRole("button")
    .filter((button) => button.getAttribute("aria-expanded") === "true")
    .map((button) => button.textContent?.replace(/\+$/, ""));

describe("FaqAccordion", () => {
  it("opens the first answer and keeps one open at a time", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={FAQS} />);

    expect(screen.getAllByRole("button")).toHaveLength(8);
    expect(expanded()).toEqual(["Can one car get more than one service?"]);
    const qr = question("How does the QR menu work?");
    const answer = document.getElementById(qr.getAttribute("aria-controls") ?? "");
    expect(answer).toHaveAttribute("aria-hidden", "true");

    await user.click(qr);
    expect(expanded()).toEqual(["How does the QR menu work?"]);
    expect(answer).toHaveAttribute("aria-hidden", "false");
    expect(answer).toHaveTextContent("Cartory Wash creates a QR code for your service list.");

    await user.click(qr);
    expect(expanded()).toEqual([]);
    expect(answer).toHaveAttribute("aria-hidden", "true");
  });
});
