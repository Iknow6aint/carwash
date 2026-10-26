/** An unsigned JWT-shaped token whose `exp` is `expMs` (only `exp` matters to the desk). */
export function tokenExpiringAt(expMs: number): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "RS256" })}.${encode({ exp: Math.floor(expMs / 1000) })}.sig`;
}
