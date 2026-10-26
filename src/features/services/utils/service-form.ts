import { koboToNaira, nairaToKobo, parseNairaInput } from "@/lib/format/money";

import type { Service } from "../schemas/service.schema";

/** What an admin types for a service: a name and a whole-naira price. */
export interface ServiceDraft {
  name: string;
  price: string;
}

export type ServiceDraftErrors = Partial<Record<keyof ServiceDraft, string>>;

const MAX_PRICE_NAIRA = 1_000_000;

/**
 * Checks a service draft (prototype copy) and converts the price to kobo (× 100).
 *
 * @returns The `{ name, priceKobo }` body, or a message per field.
 */
export function validateServiceDraft(
  draft: ServiceDraft,
):
  | { ok: true; value: { name: string; priceKobo: number } }
  | { ok: false; errors: ServiceDraftErrors } {
  const errors: ServiceDraftErrors = {};
  const name = draft.name.trim().replace(/\s+/g, " ");
  if (!name) errors.name = "Give the service a name.";
  else if (name.length > 60) errors.name = "Keep the name to 60 characters.";

  const naira = parseNairaInput(draft.price);
  if (!naira) errors.price = "Enter a price in naira.";
  else if (naira > MAX_PRICE_NAIRA) errors.price = "Enter a price up to ₦1,000,000.";

  if (errors.name || errors.price || !naira) return { ok: false, errors };
  return { ok: true, value: { name, priceKobo: nairaToKobo(naira) } };
}

/** A draft prefilled from a service, for inline editing. */
export function draftFromService(service: Pick<Service, "name" | "priceKobo">): ServiceDraft {
  return { name: service.name, price: String(koboToNaira(service.priceKobo)) };
}
