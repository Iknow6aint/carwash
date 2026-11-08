import { FileText } from "lucide-react";

import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import { MENU_SERVICES } from "../../utils/demo-data";
import { fadeRise } from "../fade-rise";

/** Step 1, web: the price list uploads and its six services appear. */
export function WebUploadPanel({ shown }: { shown: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-heading text-[18px] font-semibold">Services · Bulk upload</p>
      <div className="flex items-center gap-3 border border-dashed border-accent bg-accent-100 p-3">
        <FileText className="size-[22px] flex-none" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px]">splashpoint-prices.csv</p>
          <div className="mt-1.5 h-[3px] bg-neutral-300">
            <div
              className={cn(
                "h-full bg-accent transition-[width] duration-1300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                shown ? "w-full" : "w-0",
              )}
            />
          </div>
        </div>
        <span className="text-[12px] text-accent-800">
          {shown ? "6 services found" : "Reading…"}
        </span>
      </div>
      <ul className="flex flex-col">
        {MENU_SERVICES.map((service, index) => {
          const motion = fadeRise(shown, { delayMs: 700 + index * 70 });
          return (
            <li
              className={cn(
                motion.className,
                "flex items-center gap-2.5 border-b border-divider py-2 text-[12px]",
              )}
              key={service.name}
              style={motion.style}
            >
              <span className="flex-1">{service.name}</span>
              <span className="tabular-nums">{service.price}</span>
              <Tag tone="accent">New</Tag>
            </li>
          );
        })}
      </ul>
      <div
        className={cn(
          "self-end bg-accent px-3.5 py-2 text-[13px] font-semibold text-bg transition-opacity delay-1200 duration-400 ease-in-out",
          shown ? "opacity-100" : "opacity-0",
        )}
      >
        Add 6 services
      </div>
    </div>
  );
}
