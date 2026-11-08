import { describe, expect, it } from "vitest";

import { COUNT_UP_MS, countUpValue } from "./count-up";

describe("countUpValue", () => {
  it("eases from 0 to the target over 1.2 s and holds there", () => {
    expect(countUpValue(184_500, 0)).toBe(0);
    const half = countUpValue(184_500, COUNT_UP_MS / 2);
    expect(half).toBeGreaterThan(184_500 / 2);
    expect(half).toBeLessThan(184_500);
    expect(countUpValue(184_500, COUNT_UP_MS)).toBe(184_500);
    expect(countUpValue(184_500, COUNT_UP_MS * 3)).toBe(184_500);
  });
});
