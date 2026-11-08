import { z } from "zod";

/**
 * "Book a demo": the visitor's details go to the sales WhatsApp number as a pre-filled message.
 * Nothing is stored or sent by us; the visitor presses send in WhatsApp.
 */

export const WASH_BAY_OPTIONS = ["1–2", "3–5", "6+"] as const;
export type WashBays = (typeof WASH_BAY_OPTIONS)[number];

export const DEMO_REQUEST_ERRORS = {
  names: "Add your name and your car wash name.",
  phone: "Enter a phone number we can call.",
} as const;

const requiredName = z.string().trim().min(1, DEMO_REQUEST_ERRORS.names);

/** Names first, then the phone (at least 10 digits, any spacing), as in the design. */
export const demoRequestSchema = z.object({
  name: requiredName,
  business: requiredName,
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, DEMO_REQUEST_ERRORS.phone),
  bays: z.enum(WASH_BAY_OPTIONS),
});

export type DemoRequestInput = z.input<typeof demoRequestSchema>;
export type DemoRequest = z.output<typeof demoRequestSchema>;

export const emptyDemoRequest: DemoRequestInput = {
  name: "",
  business: "",
  phone: "",
  bays: "1–2",
};

/** The request, or the one error to show (the first problem, in field order). */
export function parseDemoRequest(
  input: DemoRequestInput,
): { ok: true; data: DemoRequest } | { ok: false; error: string } {
  const result = demoRequestSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues[0]?.message ?? DEMO_REQUEST_ERRORS.names };
}

export function buildDemoMessage(request: DemoRequest): string {
  return [
    "Hello Cartory Wash, I'd like a demo.",
    `Name: ${request.name}`,
    `Car wash: ${request.business}`,
    `Phone: ${request.phone}`,
    `Wash bays: ${request.bays}`,
  ].join("\n");
}

/** A wa.me link that opens a chat with `number` (international digits) and `message` typed in. */
export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function demoWhatsAppUrl(number: string, request: DemoRequest): string {
  return buildWhatsAppUrl(number, buildDemoMessage(request));
}
