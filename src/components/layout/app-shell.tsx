"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type PropsWithChildren } from "react";

import {
  sectionLabel,
  shellNavigation,
  type ShellArea,
} from "@/components/navigation/navigation-items";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { Tag } from "@/components/ui/tag";
import { ROLE_LABELS } from "@/lib/auth/access";
import { useSession } from "@/providers/session-provider";

import { Brand, BrandMark } from "./brand";
import { SignOutButton } from "./sign-out-button";

const KICKERS: Record<ShellArea, string> = { desk: "Payment desk", platform: "Platform" };

interface ShellProps {
  /** Which sidebar to show. A key, not the items: icons can't be passed from a server layout. */
  area: ShellArea;
  /** The brand name: the business on the desk, the app on the platform. */
  title: string;
}

function Sidebar({ area, title, onNavigate }: ShellProps & { onNavigate?: () => void }) {
  const { user } = useSession();
  return (
    <div className="flex h-full flex-col gap-7 overflow-y-auto px-3.5 py-7">
      <Brand kicker={KICKERS[area]} name={title} />
      <SidebarNavigation items={shellNavigation[area]} onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-0.5 px-1.5">
        <p className="text-[11px] text-neutral-700">Signed in as</p>
        <p className="text-[14px] font-medium break-words">{user.name}</p>
        <div>
          <Tag tone={user.role === "cashier" ? "neutral" : "accent"}>{ROLE_LABELS[user.role]}</Tag>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}

/**
 * The signed-in frame for the desk and the platform. At `lg`+ a fixed sidebar (brand, navigation,
 * who is signed in); below `lg` a top bar with the page name and a Menu button that opens the same
 * sidebar as a drawer. Pages render their own PageHeader.
 */
export function AppShell({ area, title, children }: PropsWithChildren<ShellProps>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const section = sectionLabel(pathname, shellNavigation[area]);

  return (
    <div className="min-h-dvh bg-bg">
      <a
        className="fixed top-3 left-3 z-[100] -translate-y-24 bg-accent px-4 py-2 text-[14px] font-medium text-bg focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-divider lg:block">
        <Sidebar area={area} title={title} />
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
                <Sidebar area={area} onNavigate={() => setDrawerOpen(false)} title={title} />
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
            {title}
            {section ? <span className="text-neutral-700"> · {section}</span> : null}
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
