/** Shown wherever a value is missing (PROJECT_GUIDE §10). */
export const EM_DASH = "—";

/** "1 car", "3 cars". */
export function plural(count: number, one: string, many: string = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** A 0–1 share as a whole percentage: 0.4375 → "44%". */
export function formatShare(share: number): string {
  return `${Math.round(share * 100)}%`;
}
