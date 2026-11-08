"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useHeroClock } from "../../hooks/use-hero-clock";
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion";
import { heroFrame } from "../../utils/hero-frame";
import { useIntro } from "../intro/intro-provider";
import { CONTAINER } from "../landing-classes";

import { HeroDemo } from "./hero-demo";
import { HeroSteps } from "./hero-steps";

/**
 * The hero: copy on the left, the animated desk on the right. Its entrance waits behind the intro
 * (`data-hold`) and the sale loop starts as the intro lifts.
 */
export function HeroStage({ copy }: { copy: ReactNode }) {
  const intro = useIntro();
  const reduced = usePrefersReducedMotion();
  const clock = useHeroClock({ run: intro.run, ready: intro.heroReady, reduced });
  const frame = heroFrame(clock.step);

  return (
    <header
      className={cn(
        CONTAINER,
        "grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-[clamp(40px,5vw,72px)] pt-[clamp(48px,8vw,96px)] pb-18",
      )}
      data-hold={intro.phase === "play" ? "" : undefined}
      id="top"
    >
      <div className="flex min-w-0 flex-col gap-5">
        {copy}
        <HeroSteps stage={frame.stage} />
      </div>
      <HeroDemo clock={clock} frame={frame} tilt={!reduced} />
    </header>
  );
}
