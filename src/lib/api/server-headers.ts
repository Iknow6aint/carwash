import type { ServerEnv } from "@/config/env";

/**
 * Headers every server-to-server call to the API carries (carwash-api/docs/api/README.md,
 * "Server-to-server headers"). In production every call comes from Vercel's servers, so the API
 * cannot see the browser's IP: `X-Client-Ip` tells it, and `X-Security-Key` proves the call is from
 * this app, so the API can rate-limit sign-in and refresh per browser.
 *
 * No `server-only` import: the proxy uses these too (it reads `request.headers` directly).
 */

/** An IPv4 or IPv6 address (incl. `::ffff:1.2.3.4`); anything else is not forwarded. */
const PLAUSIBLE_IP = /^[0-9A-Fa-f:.]{2,45}$/;

/**
 * The browser's IP from the incoming request: the first `x-forwarded-for` entry, else
 * `x-real-ip`; `undefined` when neither holds an address.
 */
export function clientIpFrom(headers: Pick<Headers, "get">): string | undefined {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded && PLAUSIBLE_IP.test(forwarded)) return forwarded;
  const real = headers.get("x-real-ip")?.trim();
  return real && PLAUSIBLE_IP.test(real) ? real : undefined;
}

/** `X-Security-Key` when the key is configured, `X-Client-Ip` when the IP is known. */
export function serverToServerHeaders(
  environment: Pick<ServerEnv, "API_SECURITY_KEY">,
  clientIp: string | undefined,
): Record<string, string> {
  return {
    ...(environment.API_SECURITY_KEY ? { "X-Security-Key": environment.API_SECURITY_KEY } : {}),
    ...(clientIp ? { "X-Client-Ip": clientIp } : {}),
  };
}
