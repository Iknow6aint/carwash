"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { isActivePath, navigationItems } from "./navigation-items";

/**
 * Sidebar links. The active page wears the selected treatment: accent-100 fill, accent-300 edge,
 * accent-800 text.
 */
export function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {navigationItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-2.5 border px-2.5 py-[9px] text-[14px] font-medium no-underline transition-colors focus-visible:-outline-offset-2",
              active
                ? "border-accent-300 bg-accent-100 text-accent-800 hover:text-accent-800"
                : "border-transparent text-text hover:bg-neutral-100 hover:text-text",
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
