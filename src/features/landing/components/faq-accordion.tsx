"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import { useHydrated } from "../hooks/use-hydrated";
import type { Faq } from "../utils/content";

import { fadeRise } from "./fade-rise";

/**
 * The FAQ: one answer open at a time (the first to start). Before JavaScript runs every answer is
 * open, so the page reads in full without it.
 */
export function FaqAccordion({ items, className }: { items: readonly Faq[]; className?: string }) {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      {items.map((item, index) => {
        const current = open === index;
        const expanded = !hydrated || current;
        const answerId = `${baseId}-${index}`;
        const answer = fadeRise(expanded, {
          from: "translateY(-6px)",
          fadeMs: 400,
          moveMs: 500,
          fadeDelayMs: 80,
        });
        return (
          <div className="border-t border-divider" key={item.question}>
            <h3 className="m-0 leading-normal">
              <button
                aria-controls={answerId}
                aria-expanded={expanded}
                className={cn(
                  "flex w-full items-center gap-4 py-5 text-left font-heading text-[22px] font-semibold transition-colors duration-250 hover:text-accent",
                  current ? "text-accent" : "text-text",
                )}
                onClick={() => setOpen((value) => (value === index ? -1 : index))}
                type="button"
              >
                <span className="flex-1">{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "font-body text-[24px] font-normal text-accent transition-transform duration-400 ease-(--cw-ease)",
                    current && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              aria-hidden={!expanded}
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-(--cw-ease)",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              id={answerId}
            >
              <div className="min-h-0 overflow-hidden">
                <p
                  className={cn(
                    answer.className,
                    "mb-[22px] max-w-[640px] text-[15px] leading-[1.6] text-neutral-800",
                  )}
                  style={answer.style}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
