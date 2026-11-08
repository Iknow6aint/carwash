import { cn } from "@/lib/utils";

import type { HeroFrame } from "../../utils/hero-frame";
import { enterDelay } from "../fade-rise";
import styles from "../landing.module.css";

const STEPS = [
  { number: "01", label: "Services" },
  { number: "02", label: "Method" },
  { number: "03", label: "Save" },
] as const;

/** "A sale in three steps": fills in step by step with the desk mock. */
export function HeroSteps({ stage }: { stage: HeroFrame["stage"] }) {
  return (
    <div
      className={cn(
        styles.enterFade,
        "flex max-w-[540px] flex-col gap-2 border-t border-divider pt-3.5",
      )}
      style={enterDelay(0.75)}
    >
      <p className="text-[11px] tracking-[0.12em] text-neutral-700 uppercase">
        A sale in three steps
      </p>
      <ol className="grid grid-cols-3 gap-1.5">
        {STEPS.map((step, index) => (
          <li className="flex flex-col gap-1.5" key={step.number}>
            <span aria-hidden="true" className="h-[3px] overflow-hidden bg-neutral-300">
              <span
                className={cn(
                  "block h-full bg-accent transition-[width] duration-600 ease-(--cw-ease)",
                  stage >= index ? "w-full" : "w-0",
                )}
              />
            </span>
            <span
              className={cn(
                "text-[13px] transition-colors duration-300",
                stage === index ? "text-text" : "text-neutral-600",
              )}
            >
              <span className="font-heading font-semibold">{step.number}</span> {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
