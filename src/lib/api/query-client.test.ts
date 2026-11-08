import { describe, expect, it } from "vitest";

import { ApiError } from "./api-error";
import { redirectForError } from "./query-client";

describe("redirectForError", () => {
  it("sends an ended session to sign in and back to the same page", () => {
    const error = new ApiError("Your session has ended.", 401, "unauthorized");
    expect(redirectForError(error, "/transactions?range=7d")).toBe(
      "/login?returnTo=%2Ftransactions%3Frange%3D7d",
    );
  });

  it.each(["BUSINESS_SUSPENDED", "BUSINESS_PENDING"])(
    "sends staff of a business that stopped being active to the status page (%s)",
    (code) => {
      const error = new ApiError("This business has been suspended.", 403, "forbidden", "r1", code);
      expect(redirectForError(error, "/dashboard")).toBe("/business-status");
    },
  );

  it("leaves every other error in place", () => {
    expect(
      redirectForError(new ApiError("No.", 403, "forbidden", "r1", "FORBIDDEN"), "/new"),
    ).toBeNull();
    expect(redirectForError(new Error("boom"), "/new")).toBeNull();
  });
});
