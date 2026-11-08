"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

import type { AutoTabs } from "../hooks/use-auto-tabs";
import type { TabStep } from "../utils/content";
import { cssVars } from "../utils/css-vars";

/**
 * The numbered steps beside a mock: one open at a time (a disclosure per step, `aria-expanded`),
 * the open one with a progress bar that fills while the list advances by itself. The whole row is
 * clickable; the button is the step's title.
 */
export function AutoTabList({
  steps,
  tabs,
  barMs,
  titleClassName,
  indentOnHover = false,
  className,
}: {
  steps: readonly TabStep[];
  tabs: AutoTabs;
  /** How long the progress bar takes to fill (just under the advance interval). */
  barMs: number;
  titleClassName: string;
  indentOnHover?: boolean;
  className?: string;
}) {
  const baseId = useId();

  return (
    <ol className={cn("flex min-w-0 flex-col", className)}>
      {steps.map((step, index) => {
        const active = index === tabs.active;
        const expanded = tabs.expandAll || active;
        const filled = active && tabs.entered;
        const descriptionId = `${baseId}-${index}`;
        return (
          <li
            className={cn(
              "relative border-t border-divider py-[18px]",
              indentOnHover && "hover:pl-1.5",
            )}
            key={step.title}
          >
            <h3 className="m-0 leading-normal">
              <button
                aria-controls={descriptionId}
                aria-expanded={expanded}
                className="flex items-baseline gap-3.5 text-left font-heading font-semibold after:absolute after:inset-0"
                onClick={() => tabs.pick(index)}
                type="button"
              >
                <span
                  className={cn(
                    "text-[16px] transition-colors duration-300",
                    active ? "text-accent" : "text-neutral-600",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    titleClassName,
                    "transition-colors duration-300",
                    active ? "text-text" : "text-neutral-600",
                  )}
                >
                  {step.title}
                </span>
              </button>
            </h3>
            <div
              aria-hidden={!expanded}
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-(--cw-ease)",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              id={descriptionId}
            >
              <div className="min-h-0 overflow-hidden">
                <p
                  className={cn(
                    "pt-2 pl-8 text-[14px] leading-normal text-neutral-800 transition-opacity delay-100 duration-400",
                    expanded ? "opacity-100" : "opacity-0",
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className={cn(
                "mt-3 h-0.5 bg-neutral-300 transition-opacity duration-300",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              <div
                className={cn(
                  "h-full bg-accent",
                  filled ? "w-full" : "w-0",
                  filled && tabs.auto && "transition-[width] duration-(--bar-ms) ease-linear",
                )}
                style={cssVars({ "--bar-ms": `${barMs}ms` })}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
