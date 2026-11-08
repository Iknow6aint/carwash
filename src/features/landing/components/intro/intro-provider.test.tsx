import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { INTRO_SEEN_KEY } from "../../utils/intro-session";

import { IntroProvider } from "./intro-provider";

function renderPage() {
  return render(
    <IntroProvider>
      <a href="#demo">Book a demo</a>
    </IntroProvider>,
  );
}

describe("IntroProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.sessionStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = "";
  });

  it("covers the page on the first visit, then lifts by itself after 3.5 s", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Skip intro" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    // The page behind is inert while the intro plays.
    const link = screen.getByRole("link", { name: "Book a demo" });
    expect(link.closest("[inert]")).not.toBeNull();

    act(() => vi.advanceTimersByTime(3_500));
    expect(document.body.style.overflow).toBe("");
    expect(window.sessionStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
    expect(link.closest("[inert]")).toBeNull();

    act(() => vi.advanceTimersByTime(1_050));
    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
  });

  it("lifts at once on Skip intro", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage();
    await user.click(screen.getByRole("button", { name: "Skip intro" }));
    expect(window.sessionStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
    act(() => vi.advanceTimersByTime(1_050));
    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
  });

  it("doesn't play again in the same session", () => {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    renderPage();
    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("link", { name: "Book a demo" }).closest("[inert]")).toBeNull();
  });
});
