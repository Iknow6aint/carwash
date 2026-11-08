import Image from "next/image";
import Link from "next/link";

import { Corners } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { NAV_LINKS } from "../utils/content";

import { CONTAINER } from "./landing-classes";
import styles from "./landing.module.css";
import { StickyNav } from "./sticky-nav";

/**
 * Brand, section anchors, Sign in and Book a demo. Below 768 px the anchors leave the bar (they
 * would wrap it to four rows); the footer repeats them.
 */
export function SiteNav() {
  return (
    <StickyNav>
      <div className={cn(CONTAINER, "flex flex-wrap items-center gap-5 py-3")}>
        <a className="flex items-center gap-2.5 text-text no-underline hover:text-text" href="#top">
          <Image
            alt=""
            className="size-9 object-contain transition-transform duration-500 ease-(--cw-ease) hover:scale-[1.08] hover:-rotate-12"
            height={36}
            src="/brand/cartory-mark.png"
            width={36}
          />
          <span className="font-heading text-[22px] font-semibold tracking-[-0.01em]">
            Cartory Wash
          </span>
        </a>
        <ul className="ml-auto hidden flex-wrap gap-5 text-[14px] md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                className="border-b border-transparent py-1 text-neutral-800 no-underline transition-[color,border-color] duration-200 hover:border-accent hover:text-accent"
                href={link.href}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-1.5 max-md:ml-auto">
          <Link className={buttonVariants({ variant: "ghost" })} href="/login">
            Sign in
          </Link>
          <a className={buttonVariants({ marks: true, className: styles.lift })} href="#demo">
            <Corners />
            Book a demo
          </a>
        </div>
      </div>
    </StickyNav>
  );
}
