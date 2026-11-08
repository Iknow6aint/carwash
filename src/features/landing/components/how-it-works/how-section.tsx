import { cn } from "@/lib/utils";

import { ACCENT_PHRASE, CONTAINER, SECTION_TITLE, SECTION_Y } from "../landing-classes";
import { SectionKicker } from "../section-kicker";

import { HowTabs } from "./how-tabs";

/** 03 How it works: four steps, each with its web screen and phone screen. */
export function HowSection() {
  return (
    <section className="border-y border-divider bg-black" id="how">
      <div className={cn(CONTAINER, SECTION_Y, "flex flex-col gap-7")}>
        <SectionKicker label="How it works" number="03" />
        <HowTabs
          heading={
            <h2 className={cn(SECTION_TITLE, "max-w-[820px]")} data-reveal="80">
              From price list to <em className={ACCENT_PHRASE}>paid,</em> on web and mobile.
            </h2>
          }
        />
        <p className="text-[12px] text-neutral-600">Illustrative demo data.</p>
      </div>
    </section>
  );
}
