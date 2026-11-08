import { cn } from "@/lib/utils";

import { PROBLEMS } from "../utils/content";

import { ACCENT_PHRASE, CONTAINER, SECTION_TITLE, SECTION_Y } from "./landing-classes";
import { SectionKicker } from "./section-kicker";

/** 01 Why: the three ways money goes missing at a busy wash. */
export function WhySection() {
  return (
    <section className={cn(CONTAINER, SECTION_Y, "flex flex-col gap-7")} id="problem">
      <SectionKicker label="Why Cartory Wash" number="01" />
      <h2 className={cn(SECTION_TITLE, "max-w-[900px] text-balance")} data-reveal="80">
        A busy day can still end with <em className={ACCENT_PHRASE}>less money</em> than it should.
      </h2>
      {/* Three ruled columns from 768 px; stacked with rules between below that. */}
      <div className="grid grid-cols-1 border-t border-divider md:grid-cols-3">
        {PROBLEMS.map((problem, index) => (
          <article
            className={cn(
              "flex flex-col gap-2.5 border-divider py-5",
              index === 0 ? "md:pr-5" : "md:px-5",
              index < PROBLEMS.length - 1 && "max-md:border-b md:border-r",
            )}
            data-reveal={index * 120}
            key={problem.number}
          >
            <p
              aria-hidden="true"
              className="font-heading text-[56px] leading-none font-semibold text-neutral-400 transition-colors duration-300 hover:text-accent"
            >
              {problem.number}
            </p>
            <h3 className="m-0 text-[22px]">{problem.title}</h3>
            <p className="m-0 text-[15px] leading-[1.55] text-neutral-800">{problem.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
