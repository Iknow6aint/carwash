import { PLATFORM_PATH } from "@/lib/auth/return-to";

/** The platform page for one business. */
export function businessDetailPath(id: string): string {
  return `${PLATFORM_PATH}/businesses/${encodeURIComponent(id)}`;
}
