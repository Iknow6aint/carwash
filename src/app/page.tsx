import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: { absolute: "Cartory Wash · Payment desk for car washes" },
  description:
    "Cartory Wash gives your cashiers a three-tap payment desk and gives you a live view of cars washed, money collected and who collected it, by bank transfer or POS.",
};

/**
 * `/`: the public landing page, prerendered as static HTML. It needs no session; "Sign in" goes to
 * `/login`, which forwards a signed-in user to their desk.
 */
export default function HomePage() {
  return <LandingPage />;
}
