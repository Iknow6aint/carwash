import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerBusiness } from "../services/auth.service";
import { initialRegisterState } from "../utils/form-state";

import { RegisterForm } from "./register-form";

vi.mock("../services/auth.service", () => ({ registerBusiness: vi.fn() }));

describe("RegisterForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("asks for the business and the owner, and links back to sign in", () => {
    render(<RegisterForm />);
    expect(screen.getByRole("heading", { name: "Register your car wash" })).toBeInTheDocument();
    for (const label of ["Business name", "Phone", "Address", "Your name", "Email", "Password"]) {
      expect(screen.getByLabelText(new RegExp(`^${label}`))).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("shows each error under its field and keeps what was typed", async () => {
    vi.mocked(registerBusiness).mockResolvedValue({
      ...initialRegisterState,
      errors: { email: "An account with that email already exists. Sign in instead." },
      values: { ...initialRegisterState.values, businessName: "Splash Point", email: "a@b.co" },
    });
    render(<RegisterForm />);
    await userEvent.click(screen.getByRole("button", { name: "Register business" }));

    const email = await screen.findByLabelText(/^Email/);
    expect(email).toHaveAccessibleDescription(
      expect.stringContaining("An account with that email already exists."),
    );
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveValue("a@b.co");
    expect(screen.getByLabelText(/^Business name/)).toHaveValue("Splash Point");
    expect(registerBusiness).toHaveBeenCalledTimes(1);
  });
});
