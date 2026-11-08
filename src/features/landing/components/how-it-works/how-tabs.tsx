"use client";

import { useRef, type ReactNode } from "react";

import { useAutoTabs } from "../../hooks/use-auto-tabs";
import { tabCounter } from "../../utils/auto-tabs";
import { HOW_STEPS } from "../../utils/content";
import { AutoTabList } from "../auto-tab-list";

import { HowPhoneMock } from "./how-phone-mock";
import { HowWebMock } from "./how-web-mock";

/** Advances every 6.2 s once in view; picking a step stops it. */
const ADVANCE_MS = 6_200;

export function HowTabs({ heading }: { heading: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const tabs = useAutoTabs({ target: ref, count: HOW_STEPS.length, intervalMs: ADVANCE_MS });

  return (
    <div className="flex flex-col gap-7" ref={ref}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        {heading}
        <p className="font-heading text-[28px] font-semibold text-neutral-600">
          {tabCounter(tabs.active, HOW_STEPS.length)}
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-7">
        <AutoTabList
          barMs={ADVANCE_MS - 100}
          className="flex-[1_1_260px]"
          indentOnHover
          steps={HOW_STEPS}
          tabs={tabs}
          titleClassName="text-[24px]"
        />
        <div
          aria-hidden="true"
          className="flex min-w-0 flex-[2.6_1_560px] flex-wrap items-end gap-5"
        >
          <HowWebMock active={tabs.active} shown={tabs.entered} />
          <HowPhoneMock active={tabs.active} shown={tabs.entered} />
        </div>
      </div>
    </div>
  );
}
