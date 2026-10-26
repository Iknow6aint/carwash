import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import type { ReactNode } from "react";

import { publicEnv } from "@/config/env";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

/** Body text: Barlow 400/500/700. */
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-barlow",
  display: "swap",
});

/** Headings and money: Barlow Condensed 400/600. */
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${publicEnv.NEXT_PUBLIC_APP_NAME} · Payment desk`,
    template: `%s · ${publicEnv.NEXT_PUBLIC_APP_NAME}`,
  },
  description: "Record car-wash sales, issue receipts and see revenue by payment method.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${barlow.variable} ${barlowCondensed.variable}`} lang="en-NG">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
