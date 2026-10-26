import { StaffPanel } from "@/features/staff/components/staff-panel";

import { BusinessDetailsCard } from "./business-details-card";

/** Settings & staff: business details beside staff accounts, stacking on narrow screens. */
export function SettingsView() {
  return (
    <div className="flex flex-wrap items-start gap-7">
      <BusinessDetailsCard />
      <StaffPanel />
    </div>
  );
}
