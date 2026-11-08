"use client";

import { useRef, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

import type { HeroClock, HeroFrame } from "../../utils/hero-frame";

import { HeroDesk } from "./hero-desk";
import { HeroPhone } from "./hero-phone";

/**
 * The decorative hero mock: the desk (tilting towards the cursor), the "₦11,000 paid" chip and the
 * owner's phone. Hidden from assistive technology; the copy beside it says the same.
 */
export function HeroDemo({
  frame,
  clock,
  tilt,
}: {
  frame: HeroFrame;
  clock: HeroClock;
  tilt: boolean;
}) {
  const deskRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const desk = deskRef.current;
    if (!desk || !tilt) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    desk.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
  };
  const onMouseLeave = () => {
    if (deskRef.current) deskRef.current.style.transform = "none";
  };

  return (
    <div
      aria-hidden="true"
      className="relative min-w-0 pt-[60px] pb-[248px] perspective-[1400px]"
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <div
        className="transition-transform duration-500 ease-(--cw-ease) transform-3d"
        ref={deskRef}
      >
        <HeroDesk frame={frame} />
      </div>
      <div
        className={cn(
          "absolute top-0 right-4 flex items-center gap-2.5 bg-accent px-3.5 py-2.5 text-bg shadow-lg transition-all duration-500 ease-(--cw-ease)",
          frame.chipShown ? "opacity-100" : "translate-y-3 scale-96 opacity-0",
        )}
      >
        <span className="font-heading text-[20px] font-bold">₦11,000</span>
        <span className="text-[12px] font-medium">Paid by transfer · Tunde B.</span>
      </div>
      <HeroPhone clock={clock} notificationShown={frame.notificationShown} />
    </div>
  );
}
