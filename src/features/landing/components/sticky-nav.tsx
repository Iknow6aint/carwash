"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./landing.module.css";

/** Past this many pixels the nav darkens and gains its bottom rule. */
const SCROLLED_AFTER_PX = 12;

/**
 * The sticky top bar: darkens once the page scrolls, with a 2 px accent bar showing how far down
 * the page is. Updates the DOM directly on scroll (no re-renders).
 */
export function StickyNav({ children }: { children: ReactNode }) {
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const y = window.scrollY || root.scrollTop;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, y / max)})`;
      navRef.current?.toggleAttribute("data-scrolled", y > SCROLLED_AFTER_PX);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-20 border-b border-transparent bg-bg/70 backdrop-blur-md transition-[background-color,border-color] duration-350 ease-in-out data-scrolled:border-divider data-scrolled:bg-bg/92"
      ref={navRef}
    >
      {children}
      <div
        aria-hidden="true"
        className={cn(styles.progress, "absolute right-0 -bottom-px left-0 h-0.5 bg-accent")}
        ref={barRef}
      />
    </nav>
  );
}
