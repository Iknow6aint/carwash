import { cn } from "@/lib/utils";

import { cssVars } from "../../utils/css-vars";
import { MENU_SERVICES } from "../../utils/demo-data";
import { fadeRise } from "../fade-rise";

/** Full wash and Engine wash get ticked on the customer's menu. */
const PICKED: Record<number, string> = { 2: "900ms", 3: "1150ms" };

/** Step 2, phone: the customer's menu after scanning; they tick two services. */
export function PhoneMenuPanel({ shown }: { shown: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <p className="font-heading text-[18px] font-semibold">Splash Point Car Wash</p>
        <p className="text-[11px] text-neutral-700">Services and prices</p>
      </div>
      <div className="border border-divider px-2 py-1.5 text-[11px] text-neutral-600">
        Search services
      </div>
      <ul className="flex flex-col">
        {MENU_SERVICES.map((service, index) => {
          const pickDelay = PICKED[index];
          const ticked = pickDelay !== undefined && shown;
          const motion = fadeRise(shown, { delayMs: 100 + index * 70, fadeMs: 400 });
          return (
            <li
              className={cn(
                motion.className,
                "flex items-center gap-2 border-b border-divider py-[7px] text-[12px]",
              )}
              key={service.name}
              style={motion.style}
            >
              <span
                className={cn(
                  "size-[13px] flex-none border transition-[background-color,border-color] delay-(--tick-delay) duration-300 ease-in-out",
                  ticked ? "border-accent bg-accent" : "border-neutral-500",
                )}
                style={cssVars({ "--tick-delay": pickDelay ?? "1150ms" })}
              />
              <span className="flex-1">{service.name}</span>
              <span className="tabular-nums">{service.price}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
