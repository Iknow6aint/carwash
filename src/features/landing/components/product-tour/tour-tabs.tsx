"use client";

import { useRef, type ReactNode } from "react";

import { useAutoTabs } from "../../hooks/use-auto-tabs";
import { tabCounter } from "../../utils/auto-tabs";
import { TOUR_STEPS } from "../../utils/content";
import { AutoTabList } from "../auto-tab-list";

import { TourWindow } from "./tour-window";

/** Advances every 5.2 s once in view; picking a screen stops it. */
const ADVANCE_MS = 5_200;

export function TourTabs({ heading }: { heading: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const tabs = useAutoTabs({ target: ref, count: TOUR_STEPS.length, intervalMs: ADVANCE_MS });

  return (
    <div className="flex flex-col gap-7" ref={ref}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        {heading}
        <p className="font-heading text-[28px] font-semibold text-neutral-600">
          {tabCounter(tabs.active, TOUR_STEPS.length)}
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-7">
        <AutoTabList
          barMs={ADVANCE_MS - 100}
          className="flex-[1_1_280px]"
          steps={TOUR_STEPS}
          tabs={tabs}
          titleClassName="text-[26px]"
        />
        <TourWindow active={tabs.active} shown={tabs.entered} />
      </div>
    </div>
  );
}
