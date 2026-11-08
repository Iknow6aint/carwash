/**
 * Geometry for the intro illustration (800 × 420 view box): a wheel spinning on its hub, a hose
 * spraying drops at it, soap bubbles rising off the tyre. Deterministic, from the design.
 */

export const WHEEL = { cx: 480, cy: 250, r: 130 } as const;

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const round = (value: number) => Math.round(value * 10) / 10;

/** Five spokes, and a lug nut between each pair. */
export const SPOKES = Array.from({ length: 5 }, (_, index) => {
  const angle = rad(index * 72);
  const nut = angle + rad(36);
  return {
    x1: round(WHEEL.cx + Math.cos(angle) * 24),
    y1: round(WHEEL.cy + Math.sin(angle) * 24),
    x2: round(WHEEL.cx + Math.cos(angle) * 76),
    y2: round(WHEEL.cy + Math.sin(angle) * 76),
    nutX: round(WHEEL.cx + Math.cos(nut) * 13),
    nutY: round(WHEEL.cy + Math.sin(nut) * 13),
  };
});

/** Water drops from the nozzle: offsets in px, delay in s; every fifth is white. */
export const DROPS = Array.from({ length: 22 }, (_, index) => ({
  r: index % 3 ? 2 : 3,
  white: index % 5 === 0,
  dx: 104 + ((index * 13) % 5) * 4,
  dy: round((((index * 37) % 23) - 11) * 6.2),
  delay: (1 + ((index * 0.071) % 0.42)).toFixed(2),
}));

/** Bubbles around the lower-left of the tyre. */
export const BUBBLES = Array.from({ length: 16 }, (_, index) => {
  const angle = rad(120 + index * 9.5);
  const distance = WHEEL.r + 4 + (index % 3) * 5;
  return {
    x: round(WHEEL.cx + Math.cos(angle) * distance),
    y: round(WHEEL.cy + Math.sin(angle) * distance),
    r: 4 + ((index * 7) % 9),
    delay: (1.45 + index * 0.07).toFixed(2),
  };
});
