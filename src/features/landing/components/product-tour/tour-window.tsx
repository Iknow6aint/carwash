import Image from "next/image";

import { Blueprint } from "@/components/ui/blueprint";

import { TOUR_STEPS } from "../../utils/content";

import { TourDashboardPanel } from "./tour-dashboard-panel";
import { TourRecordPanel } from "./tour-record-panel";
import { TourReportsPanel } from "./tour-reports-panel";
import { TourTransactionsPanel } from "./tour-transactions-panel";

const PANELS = [TourDashboardPanel, TourRecordPanel, TourTransactionsPanel, TourReportsPanel];

/** The desk window showing the active tour screen (decorative). */
export function TourWindow({ active, shown }: { active: number; shown: boolean }) {
  const Panel = PANELS[active] ?? TourDashboardPanel;
  return (
    <Blueprint
      aria-hidden="true"
      className="flex min-h-[440px] min-w-0 flex-[2.4_1_480px] flex-col bg-bg"
    >
      <div className="flex items-center gap-2 border-b border-divider px-4 py-2.5">
        <Image
          alt=""
          className="size-5 object-contain"
          height={20}
          src="/brand/cartory-mark.png"
          width={20}
        />
        <span className="font-heading text-[16px] font-semibold">{TOUR_STEPS[active]?.title}</span>
        <span className="ml-auto text-[11px] text-neutral-700">Splash Point Car Wash</span>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden p-[18px]">
        <Panel shown={shown} />
      </div>
    </Blueprint>
  );
}
