import { describe, expect, it } from "vitest";

import {
  HERO_END,
  HERO_START,
  HERO_STEP_COUNT,
  HERO_STEP_MS,
  heroClockAt,
  heroFrame,
  heroNextTickIn,
  heroRevenueSplit,
} from "./hero-frame";

const selectedTiles = (step: number) =>
  heroFrame(step)
    .tiles.filter((tile) => tile.selected)
    .map((tile) => tile.name);

describe("heroFrame", () => {
  it("starts idle: nothing chosen, ₦0, no receipt", () => {
    const frame = heroFrame(0);
    expect(frame.stage).toBe(-1);
    expect(selectedTiles(0)).toEqual([]);
    expect(frame.total).toBe("₦0");
    expect(frame.summaryServices).toBe("—");
    expect(frame.selectedCount).toBe("");
    expect(frame.receiptShown || frame.chipShown || frame.notificationShown).toBe(false);
  });

  it("taps Full wash, then searches 'eng' and adds Engine wash", () => {
    const first = heroFrame(1);
    expect(first.stage).toBe(0);
    expect(first.tiles.find((tile) => tile.tapped)?.name).toBe("Full wash");
    expect(first.total).toBe("₦6,000");
    expect(first.selectedCount).toBe("1 selected");

    const second = heroFrame(2);
    expect(second.searching).toBe(true);
    expect(second.tiles.find((tile) => tile.tapped)?.name).toBe("Engine wash");
    expect(second.tiles.filter((tile) => tile.dimmed)).toHaveLength(4);
    expect(selectedTiles(2)).toEqual(["Full wash", "Engine wash"]);
    expect(second.total).toBe("₦11,000");
    expect(second.summaryServices).toBe("2 services");
  });

  it("types the plate, picks and confirms bank transfer, then presses Save", () => {
    expect(heroFrame(3)).toMatchObject({ plate: "KJA 4", typingPlate: true });
    expect(heroFrame(4)).toMatchObject({ plate: "KJA 482 FX", typingPlate: true });

    const pick = heroFrame(5);
    expect(pick.stage).toBe(1);
    expect(pick.methods[0]).toMatchObject({ label: "Transfer", selected: true, tapped: true });
    expect(pick.methods[1]).toMatchObject({ label: "POS", selected: false });
    expect(pick).toMatchObject({ summaryMethod: "Bank transfer", confirmShown: true });
    expect(pick.confirmTicked).toBe(false);
    expect(heroFrame(6).confirmTicked).toBe(true);

    expect(heroFrame(7)).toMatchObject({ stage: 2, savePressed: true, receiptShown: false });
  });

  it("shows the receipt from step 8, the paid chip from 9 and the phone notification until 13", () => {
    const shown = (key: "receiptShown" | "chipShown" | "notificationShown") =>
      Array.from({ length: HERO_STEP_COUNT }, (_, step) => heroFrame(step)[key]).flatMap(
        (on, step) => (on ? [step] : []),
      );
    expect(shown("receiptShown")).toEqual([8, 9, 10, 11, 12, 13, 14]);
    expect(shown("chipShown")).toEqual([9, 10, 11, 12, 13, 14]);
    expect(shown("notificationShown")).toEqual([8, 9, 10, 11, 12, 13]);
  });

  it("clears the desk after the receipt and resets on the last step", () => {
    expect(heroFrame(15)).toMatchObject({ stage: 2, receiptShown: false, total: "₦11,000" });
    expect(heroFrame(16)).toMatchObject({ stage: -1, total: "₦0", plate: "" });
  });

  it("shows the finished sale as the reduced-motion end state", () => {
    expect(heroFrame(HERO_END.step)).toMatchObject({
      stage: 2,
      receiptShown: true,
      chipShown: true,
      notificationShown: true,
      plate: "KJA 482 FX",
    });
  });
});

describe("heroClockAt", () => {
  it("moves one step every 550 ms and repeats every 17 steps", () => {
    expect(heroClockAt(0)).toEqual(HERO_START);
    expect(heroClockAt(HERO_STEP_MS - 1).step).toBe(0);
    expect(heroClockAt(HERO_STEP_MS).step).toBe(1);
    expect(heroClockAt(HERO_STEP_MS * HERO_STEP_COUNT)).toEqual(HERO_START);
  });

  it("eases revenue from ₦178,500 to ₦189,500 over 900 ms from the save, with car 30", () => {
    const saved = 8 * HERO_STEP_MS;
    expect(heroClockAt(saved - 1)).toMatchObject({ revenue: 178_500, cars: 29 });
    const midway = heroClockAt(saved + 450);
    expect(midway.revenue).toBeGreaterThan(178_500);
    expect(midway.revenue).toBeLessThan(189_500);
    expect(midway.cars).toBe(30);
    expect(heroClockAt(saved + 900)).toMatchObject({ revenue: 189_500, cars: 30 });
    expect(heroClockAt(16 * HERO_STEP_MS)).toMatchObject({ step: 16, revenue: 189_500 });
  });

  it("ticks every 40 ms during the revenue tween, else at the next step", () => {
    expect(heroNextTickIn(0)).toBe(HERO_STEP_MS);
    expect(heroNextTickIn(100)).toBe(HERO_STEP_MS - 100);
    expect(heroNextTickIn(8 * HERO_STEP_MS + 10)).toBe(40);
    expect(heroNextTickIn(8 * HERO_STEP_MS + 950)).toBe(2 * HERO_STEP_MS - 950);
  });
});

describe("heroRevenueSplit", () => {
  it("grows transfer with the sale and keeps POS at ₦32,000", () => {
    expect(heroRevenueSplit(178_500)).toMatchObject({ transfer: 146_500, pos: 32_000 });
    const after = heroRevenueSplit(189_500);
    expect(after.transfer).toBe(157_500);
    expect(after.transferShare + after.posShare).toBeCloseTo(1);
  });
});
