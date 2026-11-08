"use client";

import { useEffect, useReducer, type RefObject } from "react";

import { autoTabsReducer, ENTER_DELAY_MS, initialAutoTabsState } from "../utils/auto-tabs";

import { useHydrated } from "./use-hydrated";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export interface AutoTabs {
  active: number;
  /** The active panel shows its end state. */
  entered: boolean;
  /** Advancing by itself (the progress bar fills over the interval). */
  auto: boolean;
  /** No JavaScript yet: show every description. */
  expandAll: boolean;
  pick: (index: number) => void;
}

/**
 * State for an auto-advancing tab list that starts once `target` is 20 % in view. Server HTML
 * shows the first tab's end state with every description open; with reduced motion nothing
 * advances and panels show their end state.
 */
export function useAutoTabs({
  target,
  count,
  intervalMs,
}: {
  target: RefObject<HTMLElement | null>;
  count: number;
  intervalMs: number;
}): AutoTabs {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const [state, dispatch] = useReducer(autoTabsReducer, initialAutoTabsState);

  // Start once in view (at once where IntersectionObserver is missing).
  useEffect(() => {
    if (reduced) return;
    const element = target.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      dispatch({ type: "start" });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        dispatch({ type: "start" });
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced, target]);

  useEffect(() => {
    if (reduced || !state.started || !state.auto) return;
    const timer = window.setInterval(() => dispatch({ type: "advance", count }), intervalMs);
    return () => window.clearInterval(timer);
  }, [reduced, state.started, state.auto, count, intervalMs]);

  useEffect(() => {
    if (!state.started || state.entered) return;
    const timer = window.setTimeout(() => dispatch({ type: "enter" }), ENTER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state.started, state.entered]);

  const animated = hydrated && !reduced;
  return {
    active: state.active,
    entered: animated ? state.entered : true,
    auto: animated && state.auto,
    expandAll: !hydrated,
    pick: (index) => dispatch({ type: "pick", index }),
  };
}
