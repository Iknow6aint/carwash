import { describe, expect, it } from "vitest";

import { parseRegisterForm, registerErrorsFromApi } from "./register-form";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const FILLED = {
  businessName: "Splash Point",
  businessPhone: "0812 555 0101",
  businessAddress: "",
  name: "Chidi Obi",
  email: "chidi@splash.ng",
  password: "splash-1234",
};

describe("parseRegisterForm", () => {
  it("builds the register body and leaves a blank address out", () => {
    const result = parseRegisterForm(form(FILLED));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.input).toEqual({
      businessName: "Splash Point",
      businessPhone: "0812 555 0101",
      name: "Chidi Obi",
      email: "chidi@splash.ng",
      password: "splash-1234",
    });
  });

  it("gives one message per field and keeps what was typed, never the password", () => {
    const result = parseRegisterForm(
      form({ ...FILLED, businessName: "", email: "chidi", password: "x" }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual({
      businessName: "Enter your business name.",
      email: "Enter a valid email.",
      password: "Use at least 8 characters.",
    });
    expect(result.values).toEqual({
      businessName: "",
      businessPhone: "0812 555 0101",
      businessAddress: "",
      name: "Chidi Obi",
      email: "chidi",
    });
    expect(result.values).not.toHaveProperty("password");
  });

  it("treats missing fields as empty", () => {
    const result = parseRegisterForm(new FormData());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["businessName", "businessPhone", "email", "name", "password"].sort(),
    );
  });
});

describe("registerErrorsFromApi", () => {
  it("puts a taken email under the email field and anything else above the button", () => {
    const taken = "An account with that email already exists. Sign in instead.";
    expect(registerErrorsFromApi({ code: "EMAIL_TAKEN", message: taken })).toEqual({
      email: taken,
    });
    expect(
      registerErrorsFromApi({
        code: "RATE_LIMITED",
        message: "Too many attempts. Wait a minute and try again.",
      }),
    ).toEqual({ form: "Too many attempts. Wait a minute and try again." });
  });
});
