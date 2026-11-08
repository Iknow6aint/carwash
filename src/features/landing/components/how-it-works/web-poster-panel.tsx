import { cn } from "@/lib/utils";

import { fadeRise } from "../fade-rise";
import { QrCode } from "../qr-code";

/** Step 2, web: the printable QR menu poster. */
export function WebPosterPanel({ shown }: { shown: boolean }) {
  const motion = fadeRise(shown, { from: "translateY(14px)", fadeMs: 500, moveMs: 600 });
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5">
      <p className="self-start font-heading text-[18px] font-semibold">Services · QR menu poster</p>
      <div
        className={cn(
          motion.className,
          "flex w-[min(260px,100%)] flex-col items-center gap-3 border border-divider p-5 text-center",
        )}
        style={motion.style}
      >
        <p className="font-heading text-[18px] font-semibold">Splash Point Car Wash</p>
        <p className="text-[12px] text-neutral-700">Scan for our services and prices</p>
        <div className="w-[140px]">
          <QrCode />
        </div>
        <p className="text-[10px] text-neutral-700">14 Admiralty Way, Lekki Phase 1</p>
      </div>
      <div className="flex gap-2">
        <span className="border border-divider px-3 py-[7px] text-[12px]">Download PDF</span>
        <span className="bg-accent px-3 py-[7px] text-[12px] font-semibold text-bg">
          Print poster
        </span>
      </div>
    </div>
  );
}
