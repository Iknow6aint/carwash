"use client";

import { useEffect, useState } from "react";

import {
  HERO_END,
  HERO_START,
  heroClockAt,
  heroNextTickIn,
  type HeroClock,
} from "../utils/hero-frame";

/**
 * Runs the hero's sale loop while `ready` (after the intro), restarting it for each intro `run`.
 * Before that it shows the start; with reduced motion, the finished sale.
 */
export function useHeroClock({
  run,
  ready,
  reduced,
}: {
  run: number;
  ready: boolean;
  reduced: boolean;
}): HeroClock {
  const [tick, setTick] = useState<{ run: number; clock: HeroClock } | null>(null);

  useEffect(() => {
    if (!ready || reduced) return;
    const startedAt = performance.now();
    let timer = 0;
    const schedule = (elapsed: number) => {
      timer = window.setTimeout(advance, heroNextTickIn(elapsed));
    };
    const advance = () => {
      const elapsed = performance.now() - startedAt;
      setTick({ run, clock: heroClockAt(elapsed) });
      schedule(elapsed);
    };
    schedule(0);
    return () => window.clearTimeout(timer);
  }, [ready, reduced, run]);

  if (reduced) return HERO_END;
  return ready && tick?.run === run ? tick.clock : HERO_START;
}
