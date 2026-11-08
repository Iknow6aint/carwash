import type { CSSProperties } from "react";

/** Inline CSS custom properties: per-element animation timing (`--d`, `--dx`, ...). */
export function cssVars(vars: Record<`--${string}`, string | number | undefined>): CSSProperties {
  return vars as CSSProperties;
}
