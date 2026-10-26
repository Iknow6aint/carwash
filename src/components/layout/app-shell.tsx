"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type PropsWithChildren } from "react";

import { sectionLabel } from "@/components/navigation/navigation-items";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { Tag } from "@/components/ui/tag";
import { publicEnv } from "@/config/env";
import { useBusinessSettings } from "@/features/settings/hooks/use-business-settings";
import { ROLE_LABELS } from "@/lib/auth/access";
import { useSession } from "@/providers/session-provider";

import { Brand, BrandMark } from "./brand";
import { SignOutButton } from "./sign-out-button";

/** The business name from settings, or the app name while it loads. */
function useBusinessName(): string {
  const settings = useBusinessSettings();
  return settings.data?.name ?? publicEnv.NEXT_PUBLIC_APP_NAME;
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useSession();
  const name = useBusinessName();
  return (
    <div className="flex h-full flex-col gap-7 overflow-y-auto px-3.5 py-7">
      <Brand name={name} />
      <SidebarNavigation onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-0.5 px-1.5">
        <p className="text-[11px] text-neutral-700">Signed in as</p>
        <p className="text-[14px] font-medium break-words">{user.name}</p>
        <div>
          <Tag tone={user.role === "admin" ? "accent" : "neutral"}>{ROLE_LABELS[user.role]}</Tag>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}

/**
 * The desk frame. At `lg`+ a fixed sidebar (brand, navigation, who is signed in); below `lg` a top
 * bar with the page name and a Menu button that opens the same sidebar as a drawer. Pages render
 * their own PageHeader.
 */
export function AppShell({ children }: PropsWithChildren) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const name = useBusinessName();

  return (
    <div className="min-h-dvh bg-bg">
      <a
        className="fixed top-3 left-3 z-[100] -translate-y-24 bg-accent px-4 py-2 text-[14px] font-medium text-bg focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-divider lg:block">
        <Sidebar />
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-divider bg-bg px-4 lg:hidden">
          <DialogPrimitive.Root onOpenChange={setDrawerOpen} open={drawerOpen}>
            <DialogPrimitive.Trigger asChild>
              <button
                className="-ml-1.5 inline-flex min-h-11 items-center gap-2 px-1.5 text-[14px] font-medium hover:bg-neutral-100"
                type="button"
              >
                <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
                Menu
              </button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-bg/80 lg:hidden" />
              <DialogPrimitive.Content
                aria-describedby={undefined}
                className="fixed inset-y-0 left-0 z-50 w-[min(18rem,86vw)] border-r border-divider bg-bg shadow-lg focus-visible:outline-none lg:hidden"
              >
                <DialogPrimitive.Title className="sr-only">Main navigation</DialogPrimitive.Title>
                <Sidebar onNavigate={() => setDrawerOpen(false)} />
                <DialogPrimitive.Close asChild>
                  <button
                    aria-label="Close navigation"
                    className="absolute top-2 right-2 inline-flex size-11 items-center justify-center text-neutral-700 hover:bg-neutral-100 hover:text-text"
                    type="button"
                  >
                    <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
                  </button>
                </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
          <BrandMark marks={false} size={32} />
          <p className="min-w-0 truncate text-[15px] font-medium">
            {name}
            {sectionLabel(pathname) ? (
              <span className="text-neutral-700"> · {sectionLabel(pathname)}</span>
            ) : null}
          </p>
        </header>

        <main
          className="mx-auto flex w-full max-w-[1280px] min-w-0 flex-col gap-7 px-4 pt-7 pb-16 sm:px-6 lg:px-[clamp(16px,3vw,44px)]"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
