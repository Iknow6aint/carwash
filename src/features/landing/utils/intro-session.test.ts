import { describe, expect, it } from "vitest";

import {
  INTRO_SEEN_KEY,
  initialIntroState,
  introReducer,
  markIntroSeen,
  readIntroSeen,
  shouldPlayIntro,
  type IntroAction,
  type IntroState,
} from "./intro-session";

const throwing = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

describe("intro session", () => {
  it("remembers the intro in sessionStorage under cartory-intro-seen", () => {
    window.sessionStorage.clear();
    expect(readIntroSeen(window.sessionStorage)).toBe(false);
    markIntroSeen(window.sessionStorage);
    expect(window.sessionStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
    expect(readIntroSeen(window.sessionStorage)).toBe(true);
  });

  it("treats missing or failing storage as not seen, without throwing", () => {
    expect(readIntroSeen(null)).toBe(false);
    expect(readIntroSeen(throwing)).toBe(false);
    expect(() => markIntroSeen(throwing)).not.toThrow();
  });

  it("plays only for a first visit this session without reduced motion", () => {
    expect(shouldPlayIntro({ seen: false, reducedMotion: false })).toBe(true);
    expect(shouldPlayIntro({ seen: true, reducedMotion: false })).toBe(false);
    expect(shouldPlayIntro({ seen: false, reducedMotion: true })).toBe(false);
  });
});

describe("introReducer", () => {
  const run = (...actions: IntroAction[]): IntroState =>
    actions.reduce(introReducer, initialIntroState);

  it("covers the page, lifts, cues the hero, then finishes", () => {
    expect(run({ type: "mount", play: true })).toEqual({
      phase: "play",
      run: 1,
      heroReady: false,
    });
    expect(run({ type: "mount", play: true }, { type: "lift" }).phase).toBe("lift");
    expect(run({ type: "mount", play: true }, { type: "lift" }, { type: "cue" })).toMatchObject({
      phase: "lift",
      heroReady: true,
    });
    expect(
      run({ type: "mount", play: true }, { type: "lift" }, { type: "cue" }, { type: "finish" }),
    ).toEqual({ phase: "done", run: 1, heroReady: true });
  });

  it("skips straight to done (hero running) when the intro should not play", () => {
    expect(run({ type: "mount", play: false })).toEqual({
      phase: "done",
      run: 0,
      heroReady: true,
    });
  });

  it("decides once, and ignores out-of-order steps", () => {
    expect(run({ type: "mount", play: false }, { type: "mount", play: true }).phase).toBe("done");
    expect(run({ type: "lift" }).phase).toBe("pending");
    expect(run({ type: "cue" }).heroReady).toBe(false);
    expect(run({ type: "mount", play: true }, { type: "cue" }).heroReady).toBe(false);
    expect(run({ type: "mount", play: true }, { type: "finish" }).phase).toBe("play");
  });

  it("replays from any phase, holding the hero again", () => {
    expect(run({ type: "mount", play: false }, { type: "replay" })).toEqual({
      phase: "play",
      run: 1,
      heroReady: false,
    });
  });
});
