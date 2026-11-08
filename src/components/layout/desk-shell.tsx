"use client";

import type { PropsWithChildren } from "react";

import { publicEnv } from "@/config/env";
import { useBusinessSettings } from "@/features/settings/hooks/use-business-settings";

import { AppShell } from "./app-shell";

/**
 * The payment desk's frame: the shell with the desk sidebar, branded with the business name from
 * settings (the app name while it loads), so a rename shows as soon as it is saved.
 */
export function DeskShell({ children }: PropsWithChildren) {
  const settings = useBusinessSettings();
  return (
    <AppShell area="desk" title={settings.data?.name ?? publicEnv.NEXT_PUBLIC_APP_NAME}>
      {children}
    </AppShell>
  );
}
