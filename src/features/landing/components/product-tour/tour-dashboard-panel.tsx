import { cn } from "@/lib/utils";

import { cssVars } from "../../utils/css-vars";
import { TOUR_BEST_SELLERS, TOUR_KPIS, TOUR_STAFF } from "../../utils/demo-data";
import { fadeRise } from "../fade-rise";
import { MOCK_KICKER } from "../landing-classes";

/** Tour 1: today's KPIs, best sellers and who recorded what. */
export function TourDashboardPanel({ shown }: { shown: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
        {TOUR_KPIS.map((kpi, index) => {
          const motion = fadeRise(shown, { delayMs: index * 70 });
          return (
            <div
              className={cn(motion.className, "flex flex-col gap-1.5 border border-divider p-3.5")}
              key={kpi.label}
              style={motion.style}
            >
              <span className={MOCK_KICKER}>{kpi.label}</span>
              <span className="font-heading text-[34px] leading-none font-semibold">
                {kpi.value}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
        <div className="flex flex-col gap-2.5">
          <p className="font-heading text-[17px] font-semibold">Best-selling services</p>
          {TOUR_BEST_SELLERS.map((service, index) => (
            <div className="flex flex-col gap-1" key={service.name}>
              <div className="flex text-[12px]">
                <span className="flex-1">{service.name}</span>
                <span className="text-neutral-700">{service.sold}</span>
              </div>
              <div className="h-1 bg-neutral-300">
                <div
                  className="h-full bg-accent transition-[width] delay-(--d) duration-800 ease-(--cw-ease)"
                  style={{
                    ...cssVars({ "--d": `${200 + index * 90}ms` }),
                    width: shown ? `${service.share * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="mb-2 font-heading text-[17px] font-semibold">Recorded by</p>
          {TOUR_STAFF.map((person, index) => {
            const motion = fadeRise(shown, { delayMs: 300 + index * 70 });
            return (
              <div
                className={cn(
                  motion.className,
                  "flex gap-2 border-b border-divider py-2 text-[12px]",
                )}
                key={person.name}
                style={motion.style}
              >
                <span className="flex-1">{person.name}</span>
                <span className="text-neutral-700">{person.cars}</span>
                <span className="min-w-[70px] text-right font-medium">{person.revenue}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
