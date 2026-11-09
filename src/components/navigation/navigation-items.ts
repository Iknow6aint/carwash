import {
  Building2,
  ChartColumn,
  Droplets,
  LayoutDashboard,
  List,
  QrCode,
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
  { label: "QR menu", href: "/qr-menu", icon: QrCode },
  { label: "Reports", href: "/reports", icon: ChartColumn },
  { label: "Settings & staff", href: "/settings", icon: Settings2 },
];

/** The super admin's sidebar (platform.md). To add a page, add it here under `/platform`. */
export const platformNavigationItems: readonly NavigationItem[] = [
  { label: "Businesses", href: "/platform", icon: Building2 },
];

/** Which sidebar a shell shows: the payment desk (staff) or the platform (super admins). */
export type ShellArea = "desk" | "platform";

export const shellNavigation: Record<ShellArea, readonly NavigationItem[]> = {
  desk: navigationItems,
  platform: platformNavigationItems,
};

/** Whether a nav item is the current page (exact or any page below it). */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The nav label for a path (mobile top bar). */
export function sectionLabel(
  pathname: string,
  items: readonly NavigationItem[] = navigationItems,
): string | undefined {
  return items.find((item) => isActivePath(pathname, item.href))?.label;
}
