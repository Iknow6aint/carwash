import type { ReactNode } from "react";

import { Corners } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { enterDelay } from "../fade-rise";
import { ACCENT_PHRASE } from "../landing-classes";
import styles from "../landing.module.css";

import { HeroStage } from "./hero-stage";

const HEADLINE: readonly { text: ReactNode; delay: number; pad: string }[] = [
  { text: "Every wash recorded.", delay: 0.1, pad: "pb-[0.06em]" },
  { text: "Every naira", delay: 0.22, pad: "pb-[0.06em]" },
  { text: <em className={ACCENT_PHRASE}>accounted for.</em>, delay: 0.34, pad: "pb-[0.08em]" },
];

const CTA_CLASS = cn(styles.lift, "px-[22px] py-3 text-[17px]");

/** The hero's copy (server-rendered) inside the animated stage (client). */
export function HeroSection() {
  return (
    <HeroStage
      copy={
        <>
          <p
            className={cn(styles.enterRise, "text-[12px] tracking-[0.14em] text-accent uppercase")}
            style={enterDelay(0.05)}
          >
            Payment desk for car washes
          </p>
          <h1 className="m-0 font-heading text-[clamp(52px,7.4vw,104px)] leading-[0.92] font-semibold tracking-[-0.02em]">
            {HEADLINE.map((line, index) => (
              <span className={cn("block overflow-hidden", line.pad)} key={index}>
                <span className={cn(styles.enterLine, "block")} style={enterDelay(line.delay)}>
                  {line.text}
                </span>
              </span>
            ))}
          </h1>
          <p
            className={cn(
              styles.enterRise,
              "max-w-[540px] text-[18px] leading-[1.55] text-pretty text-neutral-800",
            )}
            style={enterDelay(0.5)}
          >
            Cartory Wash gives your cashiers a three-tap payment desk and gives you a live view of
            cars washed, money collected and who collected it, by bank transfer or POS.
          </p>
          <div className={cn(styles.enterRise, "flex flex-wrap gap-2.5")} style={enterDelay(0.62)}>
            <a
              className={buttonVariants({ size: "lg", marks: true, className: CTA_CLASS })}
              href="#demo"
            >
              <Corners />
              Book a demo
            </a>
            <a
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: cn(CTA_CLASS, "hover:border-accent"),
              })}
              href="#how"
            >
              See how it works
            </a>
          </div>
        </>
      }
    />
  );
}
