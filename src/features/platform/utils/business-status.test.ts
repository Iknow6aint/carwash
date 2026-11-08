import { describe, expect, it } from "vitest";

import { businessActions } from "./business-status";

describe("businessActions", () => {
  it("offers only the transitions the API allows", () => {
    expect(businessActions("pending")).toEqual(["approve", "decline"]);
    expect(businessActions("active")).toEqual(["suspend"]);
    expect(businessActions("suspended")).toEqual(["reactivate"]);
  });
});
