import {
  ChartColumn,
  Droplets,
  LayoutDashboard,
  List,
  Settings2,
  SquarePlus,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * The desk's sidebar, in the prototype's order. Both roles open every page (cashiers read-only
 * where the API says so, PROJECT_GUIDE §2). To add a page: add an item here and create
 * `src/app/(desk)/<href>/page.tsx`.
 */
export const navigationItems: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New transaction", href: "/new", icon: SquarePlus },
  { label: "Transactions", href: "/transactions", icon: List },
  { label: "Services & prices", href: "/services", icon: Droplets },
  { label: "Reports", href: "/reports", icon: ChartColumn },
  { label: "Settings & staff", href: "/settings", icon: Settings2 },
];

/** Whether a nav item is the current page (exact or any page below it). */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The nav label for a path (mobile top bar). */
export function sectionLabel(pathname: string): string | undefined {
  return navigationItems.find((item) => isActivePath(pathname, item.href))?.label;
}
