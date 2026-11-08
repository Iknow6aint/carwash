import { cn } from "@/lib/utils";

import { MARQUEE_ITEMS } from "../utils/content";

import styles from "./landing.module.css";

/** The feature ticker: two copies scroll left in a 44 s loop and pause on hover. */
export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-divider bg-black py-4">
      <div className={cn(styles.marquee, "flex w-max")}>
        {[0, 1].map((copy) => (
          <ul aria-hidden={copy === 1 || undefined} className="flex" key={copy}>
            {MARQUEE_ITEMS.map((item) => (
              <li
                className="flex items-center gap-7 pr-7 font-heading text-[22px] font-semibold whitespace-nowrap text-neutral-800 transition-colors duration-200 hover:text-accent"
                key={item}
              >
                {item}
                <span aria-hidden="true" className="size-1.5 bg-accent" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
