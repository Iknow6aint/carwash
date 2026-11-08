import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HowTabs } from "./how-tabs";

const step = (name: RegExp) => screen.getByRole("button", { name });

describe("HowTabs", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("advances every 6.2 s until a step is picked, then stays put", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HowTabs heading={<h2>From price list to paid</h2>} />);

    expect(step(/Upload your price list/)).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("01 / 04")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(6_200));
    expect(step(/Customers scan the menu/)).toHaveAttribute("aria-expanded", "true");
    expect(step(/Upload your price list/)).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("02 / 04")).toBeInTheDocument();

    await user.click(step(/You see it, anywhere/));
    expect(step(/You see it, anywhere/)).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("04 / 04")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(30_000));
    expect(step(/You see it, anywhere/)).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("04 / 04")).toBeInTheDocument();
  });

  it("ties each step to its description", () => {
    render(<HowTabs heading={<h2>From price list to paid</h2>} />);
    const first = step(/Upload your price list/);
    expect(document.getElementById(first.getAttribute("aria-controls") ?? "")).toHaveTextContent(
      "Drop in a spreadsheet of services and prices.",
    );
  });
});
