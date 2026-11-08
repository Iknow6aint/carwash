import { cn } from "@/lib/utils";

import { DemoSection } from "./demo/demo-section";
import { FaqSection } from "./faq-section";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero/hero-section";
import { HowSection } from "./how-it-works/how-section";
import { IntroProvider } from "./intro/intro-provider";
import styles from "./landing.module.css";
import { Marquee } from "./marquee";
import { TourSection } from "./product-tour/tour-section";
import { RevealController } from "./reveal-controller";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { WhySection } from "./why-section";

/**
 * The public landing page (from the Claude Design file `landing-v2`). Server-rendered and static;
 * only the moving parts are client islands: the intro, the nav's scroll state, the hero's sale
 * loop, the feature spotlight, the two auto-advancing tab lists, the FAQ, the demo form and the
 * scroll reveal.
 */
export function LandingPage() {
  return (
    <div className={cn(styles.root, "overflow-x-clip bg-bg font-body text-text")}>
      <IntroProvider>
        <SiteNav />
        <main>
          <HeroSection />
          <Marquee />
          <WhySection />
          <FeaturesSection />
          <HowSection />
          <TourSection />
          <FaqSection />
          <DemoSection />
        </main>
        <SiteFooter />
      </IntroProvider>
      <RevealController />
    </div>
  );
}
