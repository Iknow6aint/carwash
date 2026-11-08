import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { cssVars } from "../utils/css-vars";

import styles from "./landing.module.css";

export const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
export const EASE_POP = "cubic-bezier(0.3, 1.4, 0.5, 1)";

interface FadeRiseOptions {
  /** Delay before both transitions (the design's staggered `--d`). */
  delayMs?: number;
  /** Extra delay for the fade only. */
  fadeDelayMs?: number;
  /** Hidden transform, default `translateY(10px)`. */
  from?: string;
  fadeMs?: number;
  /** Transform duration, default `fadeMs`. */
  moveMs?: number;
  fadeEase?: string;
  moveEase?: string;
  /** Also fade the background colour in (the newest dashboard row). */
  flash?: boolean;
}

/**
 * Class and variables for a mock element that fades and slides in when `shown` turns true (and
 * back out when it turns false).
 */
export function fadeRise(
  shown: boolean,
  {
    delayMs = 0,
    fadeDelayMs,
    from,
    fadeMs,
    moveMs,
    fadeEase,
    moveEase,
    flash,
  }: FadeRiseOptions = {},
): { className: string; style: CSSProperties } {
  return {
    className: cn(flash ? styles.fadeRiseFlash : styles.fadeRise, !shown && styles.hiddenState),
    style: cssVars({
      "--d": `${delayMs}ms`,
      "--fade-delay": fadeDelayMs === undefined ? undefined : `${fadeDelayMs}ms`,
      "--from": from,
      "--fade-ms": fadeMs === undefined ? undefined : `${fadeMs}ms`,
      "--move-ms": moveMs === undefined ? undefined : `${moveMs}ms`,
      "--fade-ease": fadeEase,
      "--move-ease": moveEase,
    }),
  };
}

/** `--enter-delay` for a hero entrance class. */
export function enterDelay(seconds: number): CSSProperties {
  return cssVars({ "--enter-delay": `${seconds}s` });
}
