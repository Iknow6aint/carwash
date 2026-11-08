import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { FOOTER_GROUPS } from "../utils/content";

import { ReplayIntroButton } from "./intro/replay-intro-button";
import { CONTAINER } from "./landing-classes";

const LINK = "text-neutral-800 no-underline transition-colors duration-200 hover:text-accent";

export function SiteFooter() {
  return (
    <footer className="border-t border-divider">
      <div className={cn(CONTAINER, "flex flex-wrap items-start justify-between gap-7 py-12")}>
        <div className="flex max-w-[320px] flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <Image
              alt=""
              className="size-8 object-contain"
              height={32}
              src="/brand/cartory-mark.png"
              width={32}
            />
            <span className="font-heading text-[20px] font-semibold">Cartory Wash</span>
          </div>
          <p className="text-[14px] text-neutral-700">The payment desk for car washes.</p>
        </div>
        <div className="flex flex-wrap gap-[clamp(32px,6vw,80px)] text-[14px]">
          {FOOTER_GROUPS.map((group) => (
            <div className="flex flex-col gap-2" key={group.title}>
              <p className="text-[11px] tracking-[0.12em] text-neutral-600 uppercase">
                {group.title}
              </p>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("/") ? (
                      <Link className={LINK} href={link.href}>
                        {link.label}
                      </Link>
                    ) : (
                      <a className={LINK} href={link.href}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          CONTAINER,
          "flex flex-wrap justify-between gap-4 pt-4 pb-8 text-[12px] text-neutral-600",
        )}
      >
        <span>© 2026 Cartory Wash</span>
        <ReplayIntroButton />
      </div>
    </footer>
  );
}
