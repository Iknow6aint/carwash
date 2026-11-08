/** The Know card's count-up: 0 → target over 1.2 s, easing out (cubic). */
export const COUNT_UP_MS = 1_200;

export function countUpValue(target: number, elapsedMs: number): number {
  const progress = Math.min(1, Math.max(0, elapsedMs / COUNT_UP_MS));
  return Math.round(target * (1 - (1 - progress) ** 3));
}
