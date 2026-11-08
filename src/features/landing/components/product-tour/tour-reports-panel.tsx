import { cssVars } from "../../utils/css-vars";
import { REPORT_DAYS, REPORT_STATS } from "../../utils/demo-data";
import { MOCK_KICKER } from "../landing-classes";

const TALLEST = Math.max(...REPORT_DAYS.map(([transfer, pos]) => transfer + pos));
const percent = (value: number) => `${value * 100}%`;

/** Tour 4: revenue by day for 14 days, stacked transfer (cyan) under POS (orange). */
export function TourReportsPanel({ shown }: { shown: boolean }) {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-3.5 text-[11px]">
        <p className="mr-auto font-heading text-[17px] font-semibold">
          Revenue by day · last 14 days
        </p>
        <span className="flex items-center gap-[5px]">
          <span className="size-2 bg-transfer" />
          Transfer
        </span>
        <span className="flex items-center gap-[5px]">
          <span className="size-2 bg-pos" />
          POS
        </span>
      </div>
      <div className="flex h-[220px] items-end gap-[5px] border-b border-text">
        {REPORT_DAYS.map(([transfer, pos], index) => {
          const total = transfer + pos;
          return (
            <div
              className="flex flex-1 flex-col justify-end transition-[height] delay-(--d) duration-800 ease-(--cw-ease)"
              key={index}
              style={{
                ...cssVars({ "--d": `${index * 45}ms` }),
                height: shown ? percent(total / TALLEST) : "0%",
              }}
            >
              <div className="bg-pos" style={{ height: percent(pos / total) }} />
              <div className="bg-transfer" style={{ height: percent(transfer / total) }} />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {REPORT_STATS.map((stat) => (
          <div className="flex min-w-0 flex-col gap-0.5" key={stat.label}>
            <span className={MOCK_KICKER}>{stat.label}</span>
            <span className="font-heading text-[24px] font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
