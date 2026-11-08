import { z } from "zod";

/**
 * Validated configuration. `publicEnv` is safe in the browser (Next inlines `NEXT_PUBLIC_*` at
 * build time). `getServerEnv()` holds the API address and its security key, which only server
 * code (Server Actions, Route Handlers, the proxy) may read: the browser never calls the API.
 */

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default("Cartory Wash"),
  /**
   * WhatsApp number that receives the landing page's "Book a demo" requests: international
   * format, digits only (e.g. `2348030000000`). Optional; without it the landing page shows
   * "Demo booking opens soon." instead of the form. Inlined at build time.
   */
  NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER: z
    .string()
    .trim()
    .regex(
      /^\d{10,15}$/,
      "NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER must be 10–15 digits in international format, e.g. 2348030000000",
    )
    .optional(),
});

const serverEnvironmentSchema = publicEnvironmentSchema.extend({
  /** API origin including the `/v1` prefix, e.g. `http://localhost:4000/v1`. */
  API_INTERNAL_BASE_URL: z
    .url()
    .transform((value) => value.replace(/\/+$/, ""))
    .refine((value) => value.endsWith("/v1"), "API_INTERNAL_BASE_URL must include the /v1 prefix")
    .default("http://localhost:4000/v1"),
  /**
   * Shared secret sent as `X-Security-Key` on every API call (the same value as carwash-api's
   * API_SECURITY_KEY). With it the API trusts `X-Client-Ip` and rate-limits sign-in per browser
   * instead of per Vercel server. Optional locally; required on Vercel.
   */
  API_SECURITY_KEY: z
    .string()
    .trim()
    .min(32, "API_SECURITY_KEY must be at least 32 characters")
    .optional(),
});

export type PublicEnv = z.output<typeof publicEnvironmentSchema>;
export type ServerEnv = z.output<typeof serverEnvironmentSchema>;

export const publicEnv: PublicEnv = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || undefined,
  NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER || undefined,
});

/**
 * Server-only configuration. Throws in the browser so a client import fails loudly instead of
 * quietly using the localhost default.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() is server-only.");
  }
  return serverEnvironmentSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || undefined,
    NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER || undefined,
    API_INTERNAL_BASE_URL: process.env.API_INTERNAL_BASE_URL || undefined,
    API_SECURITY_KEY: process.env.API_SECURITY_KEY || undefined,
  });
}
