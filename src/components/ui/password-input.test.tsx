import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "./password-input";

describe("<PasswordInput>", () => {
  it("starts hidden and toggles the typed value visible and back", async () => {
    render(<PasswordInput aria-label="Password" defaultValue="cartory2026" />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("cartory2026");

    const show = screen.getByRole("button", { name: "Show password" });
    expect(show).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(show);
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("cartory2026");
    expect(show).toHaveAttribute("aria-pressed", "true");

    const hide = screen.getByRole("button", { name: "Hide password" });
    await userEvent.click(hide);
    expect(input).toHaveAttribute("type", "password");
    expect(hide).toHaveAttribute("aria-pressed", "false");
  });

  it("is a plain button, so it never submits the form", () => {
    render(
      <form>
        <PasswordInput aria-label="Password" />
      </form>,
    );
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("type", "button");
  });
});
