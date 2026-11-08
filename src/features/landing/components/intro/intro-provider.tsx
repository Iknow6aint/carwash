"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";

import { prefersReducedMotion } from "../../hooks/use-prefers-reduced-motion";
import {
  HERO_CUE_MS,
  INTRO_HOLD_MS,
  INTRO_LIFT_MS,
  initialIntroState,
  introReducer,
  markIntroSeen,
  readIntroSeen,
  shouldPlayIntro,
  type IntroPhase,
} from "../../utils/intro-session";

import { IntroOverlay } from "./intro-overlay";

interface IntroContextValue {
  phase: IntroPhase;
  run: number;
  heroReady: boolean;
  replay: () => void;
}

const IntroContext = createContext<IntroContextValue>({
  phase: "pending",
  run: 0,
  heroReady: false,
  replay: () => {},
});

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Plays the intro over the landing page once per session, decided after mount (the server HTML is
 * never covered). While it plays the page behind is inert, so "Skip intro" is the only thing to
 * tab to, and the body doesn't scroll.
 */
export function IntroProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(introReducer, initialIntroState);
  const { phase, run, heroReady } = state;

  useEffect(() => {
    const play = shouldPlayIntro({
      seen: readIntroSeen(sessionStore()),
      reducedMotion: prefersReducedMotion(),
    });
    dispatch({ type: "mount", play });
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    const { body } = document;
    const overflow = body.style.overflow;
    body.style.overflow = "hidden";
    const lift = () => dispatch({ type: "lift" });
    const timer = window.setTimeout(lift, INTRO_HOLD_MS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") lift();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      body.style.overflow = overflow;
    };
  }, [phase, run]);

  useEffect(() => {
    if (phase !== "lift") return;
    markIntroSeen(sessionStore());
    const cue = window.setTimeout(() => dispatch({ type: "cue" }), HERO_CUE_MS);
    const finish = window.setTimeout(() => dispatch({ type: "finish" }), INTRO_LIFT_MS);
    return () => {
      window.clearTimeout(cue);
      window.clearTimeout(finish);
    };
  }, [phase]);

  const value = useMemo<IntroContextValue>(
    () => ({
      phase,
      run,
      heroReady,
      replay: () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        dispatch({ type: "replay" });
      },
    }),
    [phase, run, heroReady],
  );

  return (
    <IntroContext.Provider value={value}>
      {phase === "play" || phase === "lift" ? (
        <IntroOverlay
          key={run}
          lifting={phase === "lift"}
          onSkip={() => dispatch({ type: "lift" })}
        />
      ) : null}
      <div inert={phase === "play"}>{children}</div>
    </IntroContext.Provider>
  );
}

/** The intro's phase, for the hero (hold its entrance, start its loop) and the replay button. */
export function useIntro(): IntroContextValue {
  return useContext(IntroContext);
}
