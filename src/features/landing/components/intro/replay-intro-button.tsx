"use client";

import { useHydrated } from "../../hooks/use-hydrated";
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion";

import { useIntro } from "./intro-provider";

/** "Replay intro" in the footer; absent without JavaScript and with reduced motion. */
export function ReplayIntroButton() {
  const { replay } = useIntro();
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  if (!hydrated || reduced) return null;
  return (
    <button
      className="p-0 text-neutral-600 transition-colors duration-200 hover:text-accent"
      onClick={replay}
      type="button"
    >
      Replay intro
    </button>
  );
}
