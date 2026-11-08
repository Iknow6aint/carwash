import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FAQS } from "../utils/content";

import { FaqAccordion } from "./faq-accordion";
import { ACCENT_PHRASE, CONTAINER, SECTION_Y } from "./landing-classes";
import styles from "./landing.module.css";
import { SectionKicker } from "./section-kicker";

/** 05 Questions. */
export function FaqSection() {
  return (
    <section className="border-t border-divider" id="faq">
      <div className={cn(CONTAINER, SECTION_Y, "flex flex-wrap items-start gap-7")}>
        <div className="flex flex-[1_1_300px] flex-col gap-5">
          <SectionKicker label="Questions" number="05" />
          <h2
            className="m-0 font-heading text-[clamp(40px,5vw,64px)] leading-[0.98] font-semibold tracking-[-0.015em]"
            data-reveal="80"
          >
            Before you <em className={ACCENT_PHRASE}>switch.</em>
          </h2>
          <a
            className={buttonVariants({
              variant: "secondary",
              className: cn(styles.lift, "self-start hover:border-accent"),
            })}
            href="#demo"
          >
            Ask us something else
          </a>
        </div>
        <FaqAccordion className="flex-[2_1_520px]" items={FAQS} />
      </div>
    </section>
  );
}
