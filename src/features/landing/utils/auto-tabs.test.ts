import { describe, expect, it } from "vitest";

import {
  autoTabsReducer,
  initialAutoTabsState,
  tabCounter,
  type AutoTabsAction,
} from "./auto-tabs";

const run = (...actions: AutoTabsAction[]) => actions.reduce(autoTabsReducer, initialAutoTabsState);

describe("autoTabsReducer", () => {
  it("advances round the tabs while auto, re-entering each panel", () => {
    const started = run({ type: "start" }, { type: "enter" });
    expect(started).toEqual({ active: 0, entered: true, auto: true, started: true });
    expect(autoTabsReducer(started, { type: "advance", count: 4 })).toMatchObject({
      active: 1,
      entered: false,
    });
    expect(run({ type: "start" }, ...Array(4).fill({ type: "advance", count: 4 })).active).toBe(0);
  });

  it("stops advancing for good once a tab is picked", () => {
    const picked = run({ type: "start" }, { type: "pick", index: 2 });
    expect(picked).toEqual({ active: 2, entered: false, auto: false, started: true });
    expect(autoTabsReducer(picked, { type: "advance", count: 4 })).toBe(picked);
    // Scrolling into view after a pick doesn't restart it.
    expect(autoTabsReducer(picked, { type: "start" })).toBe(picked);
  });
});

describe("tabCounter", () => {
  it("reads 01 / 04", () => {
    expect(tabCounter(0, 4)).toBe("01 / 04");
    expect(tabCounter(3, 4)).toBe("04 / 04");
  });
});
