import { cn } from "@/lib/utils";

import { DASHBOARD_SALES, MOCK_METHOD_SWATCH } from "../../utils/demo-data";
import { fadeRise } from "../fade-rise";
import { MOCK_KICKER } from "../landing-classes";

/** Step 4, web: the new sale lands at the top of today's dashboard. */
export function WebDashboardPanel({ shown }: { shown: boolean }) {
  const kpis = [
    { label: "Revenue", value: shown ? "₦189,500" : "₦178,500" },
    { label: "Cars washed", value: shown ? "30" : "29" },
  ];
  return (
    <div className="flex flex-col gap-3.5">
      <p className="font-heading text-[18px] font-semibold">Dashboard · Today</p>
      <div className="grid grid-cols-2 gap-2.5">
        {kpis.map((kpi) => (
          <div className="flex flex-col gap-1 border border-divider p-3" key={kpi.label}>
            <span className={MOCK_KICKER}>{kpi.label}</span>
            <span className="font-heading text-[30px] leading-none font-semibold">{kpi.value}</span>
          </div>
        ))}
      </div>
      <ul className="flex flex-col">
        {DASHBOARD_SALES.map((sale, index) => {
          const newest = index === 0;
          const motion = fadeRise(shown, {
            delayMs: (newest ? 500 : 0) + index * 70,
            flash: true,
          });
          return (
            <li
              className={cn(
                motion.className,
                "grid grid-cols-[0.8fr_1.6fr_0.9fr_0.8fr] items-center gap-2 border-b border-divider px-2 py-[9px] text-[12px]",
                newest && shown && "bg-accent-100",
              )}
              key={`${sale.time}-${sale.service}`}
              style={motion.style}
            >
              <span className="text-neutral-700">{sale.time}</span>
              <span>{sale.service}</span>
              <span className="flex items-center gap-[5px]">
                <span className={cn("size-1.5 flex-none", MOCK_METHOD_SWATCH[sale.method])} />
                {sale.method}
              </span>
              <span className="text-right font-medium">{sale.amount}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
