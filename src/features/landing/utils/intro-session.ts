/**
 * The landing intro (wheel, hose, "Rinse / Soap / Shine"): plays once per browser session, never
 * with reduced motion, and never on the server (so no-JS visitors and crawlers always get the
 * page). It lifts by itself after 3.5 s, or on a click, "Skip intro" or Escape; the footer's
 * "Replay intro" plays it again.
 */

export const INTRO_SEEN_KEY = "cartory-intro-seen";
/** How long the intro holds before lifting by itself. */
export const INTRO_HOLD_MS = 3_500;
/** The clip-path wipe that lifts it. */
export const INTRO_LIFT_MS = 1_050;
/** How far into the wipe the hero's sale loop starts. */
export const HERO_CUE_MS = 700;

type SessionStore = Pick<Storage, "getItem" | "setItem">;

/** Whether this session already saw the intro. Storage can be missing or throw (private mode). */
export function readIntroSeen(storage: SessionStore | null): boolean {
  try {
    return storage?.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(storage: SessionStore | null): void {
  try {
    storage?.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Storage is unavailable; the intro just plays again next visit.
  }
}

export function shouldPlayIntro({
  seen,
  reducedMotion,
}: {
  seen: boolean;
  reducedMotion: boolean;
}): boolean {
  return !seen && !reducedMotion;
}

/**
 * - `pending`: server render and hydration; nothing is covered.
 * - `play`: the overlay covers the page (scroll locked, page inert).
 * - `lift`: the overlay wipes away; the hero enters.
 * - `done`: the overlay is gone.
 */
export type IntroPhase = "pending" | "play" | "lift" | "done";

export interface IntroState {
  phase: IntroPhase;
  /** Counts plays, so a replay restarts the overlay's and the hero's animations. */
  run: number;
  /** The hero's sale loop may run (it waits for the intro). */
  heroReady: boolean;
}

export type IntroAction =
  | { type: "mount"; play: boolean }
  | { type: "lift" }
  | { type: "cue" }
  | { type: "finish" }
  | { type: "replay" };

export const initialIntroState: IntroState = { phase: "pending", run: 0, heroReady: false };

export function introReducer(state: IntroState, action: IntroAction): IntroState {
  switch (action.type) {
    case "mount":
      if (state.phase !== "pending") return state;
      return action.play
        ? { phase: "play", run: state.run + 1, heroReady: false }
        : { ...state, phase: "done", heroReady: true };
    case "lift":
      return state.phase === "play" ? { ...state, phase: "lift" } : state;
    case "cue":
      return state.phase === "lift" || state.phase === "done"
        ? { ...state, heroReady: true }
        : state;
    case "finish":
      return state.phase === "lift" ? { ...state, phase: "done" } : state;
    case "replay":
      return { phase: "play", run: state.run + 1, heroReady: false };
  }
}
