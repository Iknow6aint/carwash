/**
 * A fake but plausible 25 × 25 QR code for the menu mocks: seeded pseudo-random modules (the same
 * on every render) around the three finder squares. It encodes nothing.
 */

export const QR_SIZE = 25;
const FINDER = 7;

function inFinderZone(x: number, y: number): boolean {
  return (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
}

function buildModulesPath(): string {
  let seed = 11;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let path = "";
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (!inFinderZone(x, y) && random() < 0.47) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return path;
}

/** One SVG path with every data module. */
export const QR_MODULES_PATH = buildModulesPath();

/** Top-left corners of the finder squares (7 × 7 ring, 3 × 3 centre). */
export const QR_FINDERS = [
  [0, 0],
  [QR_SIZE - FINDER, 0],
  [0, QR_SIZE - FINDER],
] as const;
