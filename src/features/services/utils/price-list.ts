/**
 * The CSV price list import: two columns, `service,price`. Prices are read as whole naira and
 * converted to kobo. A header row (`service,price`) is ignored. Rows with a missing name, a bad
 * price or a duplicate name are kept in the preview but marked with `error` and never sent.
 */

export const MAX_PRICE_LIST_ROWS = 500;
export const PRICE_LIST_TEMPLATE = "service,price\nExterior wash,3000\nFull wash,6000\n";

export interface PriceListRow {
  /** 1-based line in the file, for the preview. */
  line: number;
  name: string;
  priceKobo: number | null;
  /** Why this row won't import. Valid rows have none. */
  error?: string;
}

export type PriceListParseResult =
  { ok: true; rows: PriceListRow[] } | { ok: false; error: string };

/** Same key the API uses: trimmed, single spaces, lowercased. */
export function priceListNameKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Splits one CSV line, keeping commas inside double-quoted cells and `""` escapes. */
export function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quoted) {
      if (character === '"' && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell);
  return cells;
}

/** `"₦6,000"` → 600000; returns null when there is no positive amount. */
export function parsePriceToKobo(raw: string): number | null {
  const value = Number(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value) * 100;
}

export function parsePriceListCsv(text: string): PriceListParseResult {
  const rows: PriceListRow[] = [];
  const seen = new Set<string>();
  let headerSkipped = false;

  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    if (!rawLine.trim()) continue;
    const cells = splitCsvLine(rawLine);
    const name = (cells[0] ?? "").trim();
    const price = (cells[1] ?? "").trim();

    if (!headerSkipped) {
      headerSkipped = true;
      if (
        ["service", "name"].includes(name.toLowerCase()) &&
        ["price", "amount"].includes(price.toLowerCase())
      ) {
        continue;
      }
    }

    const line = index + 1;
    const priceKobo = parsePriceToKobo(price);
    const nameKey = priceListNameKey(name);
    let error: string | undefined;
    if (!name) error = "Give the service a name.";
    else if (name.length > 60) error = "Keep the name to 60 characters.";
    else if (priceKobo === null) error = "Enter a price in naira.";
    else if (priceKobo > 100_000_000) error = "Prices can be at most ₦1,000,000.";
    else if (seen.has(nameKey)) error = "Duplicate in this file.";
    if (!error) seen.add(nameKey);

    rows.push({ line, name, priceKobo, ...(error ? { error } : {}) });
  }

  if (rows.length === 0) return { ok: false, error: "That file has no rows." };
  if (rows.length > MAX_PRICE_LIST_ROWS) {
    return { ok: false, error: `Import at most ${MAX_PRICE_LIST_ROWS} services at once.` };
  }
  return { ok: true, rows };
}
