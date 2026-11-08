import { cn } from "@/lib/utils";

import { EASE_POP, fadeRise } from "../fade-rise";
import { QrCode } from "../qr-code";

/** Step 1, phone: the admin's new QR menu, with a scan line sweeping it. */
export function PhoneQrPanel({ shown }: { shown: boolean }) {
  const motion = fadeRise(shown, {
    delayMs: 1400,
    from: "scale(0.85)",
    fadeMs: 500,
    moveMs: 600,
    moveEase: EASE_POP,
  });
  return (
    <div className="flex flex-col items-center gap-3 pt-2.5 text-center">
      <p className="font-heading text-[20px] font-semibold">Your QR menu</p>
      <div className={cn(motion.className, "w-[150px]")} style={motion.style}>
        <QrCode scanning />
      </div>
      <p className="text-[12px] leading-[1.4] text-neutral-700">
        6 services added. The menu updates when you change a price.
      </p>
      <div className="w-full bg-accent p-2.5 text-[13px] font-semibold text-bg">Print poster</div>
    </div>
  );
}
