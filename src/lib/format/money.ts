import { EM_DASH } from "./text";

/**
 * Money is integer kobo in the API (₦1 = 100 kobo). The business deals in whole naira, so the UI
 * shows ₦ with comma thousands and no decimals: "₦12,500" (PROJECT_GUIDE §10).
 */

export const KOBO_PER_NAIRA = 100;

const nairaDigits = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

/** U+2212, the typographic minus used on receipts ("−₦500"). */
const MINUS = "−";

/** "₦12,500". Negative amounts read "−₦500"; missing values an em dash. */
export function formatNaira(kobo: number | null | undefined): string {
  if (kobo === null || kobo === undefined || !Number.isFinite(kobo)) return EM_DASH;
  const naira = Math.round(kobo / KOBO_PER_NAIRA);
  const text = `₦${nairaDigits.format(Math.abs(naira))}`;
  return naira < 0 ? `${MINUS}${text}` : text;
}

/** "+₦500" or "−₦500", for differences such as a price adjustment. */
export function formatSignedNaira(kobo: number): string {
  const text = formatNaira(Math.abs(kobo));
  return kobo < 0 ? `${MINUS}${text}` : `+${text}`;
}

/** Whole naira → integer kobo (rounds stray decimals to the nearest naira). */
export function nairaToKobo(naira: number): number {
  return Math.round(naira) * KOBO_PER_NAIRA;
}

/** Integer kobo → whole naira, for prefilling an input. */
export function koboToNaira(kobo: number): number {
  return Math.round(kobo / KOBO_PER_NAIRA);
}

/**
 * Reads a whole-naira amount someone typed: "12500", "12,500", "₦ 12,500" and "12500.00" all give
 * 12500. Anything else (empty, letters, real kobo such as "12.50") gives `null`.
 */
export function parseNairaInput(text: string): number | null {
  const cleaned = text.replace(/[₦,\s]/g, "").replace(/\.0+$/, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const naira = Number(cleaned);
  return Number.isSafeInteger(naira) ? naira : null;
}
