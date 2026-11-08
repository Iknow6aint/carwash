"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` in the server HTML and while hydrating, `true` right after. Lets a component show its
 * no-JavaScript version first (e.g. every FAQ answer open) without a hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
