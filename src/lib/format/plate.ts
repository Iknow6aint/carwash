import { EM_DASH } from "./text";

/**
 * Plates are stored and shown in capitals with single spaces: "KJA 482 FX" (transactions.md).
 *
 * @returns The normalised plate, or `null` when nothing was typed.
 */
export function normalizePlate(input: string | null | undefined): string | null {
  const plate = (input ?? "").trim().replace(/\s+/g, " ").toUpperCase();
  return plate || null;
}

/** The plate for display, or an em dash when it was not recorded. */
export function formatPlate(plate: string | null | undefined): string {
  return normalizePlate(plate) ?? EM_DASH;
}
