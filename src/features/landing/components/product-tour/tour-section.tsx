import { cn } from "@/lib/utils";

import { ACCENT_PHRASE, CONTAINER, SECTION_TITLE, SECTION_Y } from "../landing-classes";
import { SectionKicker } from "../section-kicker";

import { TourTabs } from "./tour-tabs";

/** 04 Product tour: dashboard, record a payment, transactions, reports. */
export function TourSection() {
  return (
    <section className={cn(CONTAINER, SECTION_Y, "flex flex-col gap-7")} id="tour">
      <SectionKicker label="Product tour" number="04" />
      <TourTabs
        heading={
          <h2 className={cn(SECTION_TITLE, "max-w-[760px]")} data-reveal="80">
            Four screens, <em className={ACCENT_PHRASE}>one at a time.</em>
          </h2>
        }
      />
    </section>
  );
}
