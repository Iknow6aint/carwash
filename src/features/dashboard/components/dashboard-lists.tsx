import { formatNaira } from "@/lib/format/money";
import { plural } from "@/lib/format/text";

import type { Dashboard } from "../schemas/dashboard.schema";

/** Best-selling services: count and revenue, with a bar scaled to the best seller. */
export function BestSellers({ services }: { services: Dashboard["topServices"] }) {
  const maxCount = Math.max(1, ...services.map((service) => service.count));
  if (services.length === 0) {
    return <p className="text-[14px] text-neutral-700">No paid transactions yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {services.map((service) => (
        <li className="flex flex-col gap-[5px]" key={service.serviceId}>
          <div className="flex gap-2 text-[14px]">
            <span className="min-w-0 flex-1">{service.name}</span>
            <span className="text-neutral-700 tabular-nums">{service.count} sold</span>
            <span className="min-w-[84px] text-right font-medium tabular-nums">
              {formatNaira(service.revenueKobo)}
            </span>
          </div>
          <div aria-hidden="true" className="h-1 bg-neutral-200">
            <div
              className="h-full bg-accent"
              style={{ width: `${(service.count / maxCount) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Revenue by who recorded it. */
export function RecordedBy({ staff }: { staff: Dashboard["staff"] }) {
  if (staff.length === 0) return null;
  return (
    <ul className="flex flex-col">
      {staff.map((member) => (
        <li className="flex gap-2 border-b border-divider py-2 text-[14px]" key={member.userId}>
          <span className="min-w-0 flex-1">{member.name}</span>
          <span className="text-neutral-700 tabular-nums">{plural(member.count, "car")}</span>
          <span className="min-w-[84px] text-right font-medium tabular-nums">
            {formatNaira(member.revenueKobo)}
          </span>
        </li>
      ))}
    </ul>
  );
}
