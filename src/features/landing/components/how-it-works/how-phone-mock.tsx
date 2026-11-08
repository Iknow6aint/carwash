import { cn } from "@/lib/utils";

import { HOW_PHONE_TAGS } from "../../utils/demo-data";

import { PhoneMenuPanel } from "./phone-menu-panel";
import { PhoneOwnerPanel } from "./phone-owner-panel";
import { PhoneQrPanel } from "./phone-qr-panel";
import { PhoneReceiptPanel } from "./phone-receipt-panel";

const PANELS = [PhoneQrPanel, PhoneMenuPanel, PhoneReceiptPanel, PhoneOwnerPanel];
const MENU_STEP = 1;

/** The phone for the active step (admin, customer, customer receipt, owner). */
export function HowPhoneMock({ active, shown }: { active: number; shown: boolean }) {
  const Panel = PANELS[active] ?? PhoneQrPanel;
  return (
    <div className="mx-auto flex-[0_0_232px] border border-neutral-400 bg-black p-[9px] shadow-lg">
      <div className="relative flex h-[440px] flex-col overflow-hidden border border-divider bg-bg">
        <div className="flex justify-between px-3 pt-2 pb-1 text-[10px] text-neutral-700">
          <span>5:42</span>
          <span className="text-[9px] tracking-[0.1em] text-accent uppercase">
            {HOW_PHONE_TAGS[active]}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3 pt-2 pb-3">
          <Panel shown={shown} />
        </div>
        {active === MENU_STEP ? (
          <div
            className={cn(
              "flex items-center justify-between bg-accent px-3 py-2.5 text-[12px] font-semibold text-bg transition-transform delay-1300 duration-500 ease-(--cw-ease)",
              !shown && "translate-y-full",
            )}
          >
            <span>2 services</span>
            <span className="font-heading text-[18px]">₦11,000</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
