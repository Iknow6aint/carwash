"use client";

import { useEffect } from "react";

import { formatNaira, nairaToKobo } from "@/lib/format/money";

import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";
import { COUNT_UP_MS, countUpValue } from "../utils/count-up";

/** After this the element's own transitions (hover, focus) come back. */
const REVEAL_MS = 1_100;
const COUNT_LAG_MS = 150;

/**
 * Scroll reveal for every `[data-reveal="<delay ms>"]` element below the fold: it waits hidden
 * (28 px down, transparent) and rises in as it scrolls into view. Naira figures marked
 * `[data-count]` inside count up from ₦0. The server HTML is untouched, so nothing is hidden
 * without JavaScript, above the fold, or with reduced motion. Renders nothing.
 */
export function RevealController() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") return;
    const cleanups: (() => void)[] = [];

    const countUp = (element: HTMLElement, delayMs: number) => {
      const target = Number(element.dataset.count);
      const show = (value: number) => {
        element.textContent = formatNaira(nairaToKobo(value));
      };
      let frame = 0;
      const timer = window.setTimeout(() => {
        const startedAt = performance.now();
        const step = () => {
          const elapsed = performance.now() - startedAt;
          show(countUpValue(target, elapsed));
          if (elapsed < COUNT_UP_MS) frame = requestAnimationFrame(step);
        };
        step();
      }, delayMs + COUNT_LAG_MS);
      cleanups.push(() => {
        window.clearTimeout(timer);
        cancelAnimationFrame(frame);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          const delay = Number(element.dataset.reveal) || 0;
          element.dataset.revealState = "shown";
          element.querySelectorAll<HTMLElement>("[data-count]").forEach((figure) => {
            countUp(figure, delay);
          });
          const timer = window.setTimeout(() => {
            delete element.dataset.revealState;
          }, REVEAL_MS + delay);
          cleanups.push(() => window.clearTimeout(timer));
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.style.setProperty("--reveal-delay", `${Number(element.dataset.reveal) || 0}ms`);
      element.dataset.revealState = "hidden";
      element.querySelectorAll<HTMLElement>("[data-count]").forEach((figure) => {
        figure.textContent = formatNaira(0);
      });
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      elements.forEach((element) => {
        delete element.dataset.revealState;
        element.style.removeProperty("--reveal-delay");
        element.querySelectorAll<HTMLElement>("[data-count]").forEach((figure) => {
          figure.textContent = formatNaira(nairaToKobo(Number(figure.dataset.count)));
        });
      });
    };
  }, [reduced]);

  return null;
}
