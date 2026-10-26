import { describe, expect, it } from "vitest";

import { formatPaymentMethod, PAYMENT_METHODS } from "./payment-method";
import { formatShare, plural } from "./text";

describe("labels", () => {
  it("keeps payment methods in cash → transfer → POS order, unabbreviated", () => {
    expect(PAYMENT_METHODS.map(formatPaymentMethod)).toEqual(["Cash", "Bank transfer", "POS"]);
  });

  it("pluralises and rounds shares", () => {
    expect(plural(1, "car")).toBe("1 car");
    expect(plural(3, "car")).toBe("3 cars");
    expect(formatShare(0.4375)).toBe("44%");
    expect(formatShare(0)).toBe("0%");
  });
});
