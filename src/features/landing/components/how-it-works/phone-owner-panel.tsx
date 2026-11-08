import Image from "next/image";

import { cn } from "@/lib/utils";

import { EASE_OUT, fadeRise } from "../fade-rise";

/** Step 4, phone: the owner's notification and today's numbers. */
export function PhoneOwnerPanel({ shown }: { shown: boolean }) {
  const notification = fadeRise(shown, {
    delayMs: 500,
    from: "translateY(-14px)",
    fadeMs: 550,
    fadeEase: EASE_OUT,
  });
  return (
    <div className="relative flex flex-col gap-2.5">
      <div
        className={cn(
          notification.className,
          "flex items-start gap-[7px] border border-neutral-400 bg-neutral-200 p-[9px]",
        )}
        style={notification.style}
      >
        <Image
          alt=""
          className="size-[18px] flex-none object-contain"
          height={18}
          src="/brand/cartory-mark.png"
          width={18}
        />
        <div className="text-[10.5px] leading-[1.35]">
          <p className="font-semibold">Tunde recorded ₦11,000</p>
          <p className="text-neutral-700">Full wash + Engine wash · Transfer</p>
        </div>
      </div>
      <p className="mt-1 text-[9px] tracking-[0.1em] text-accent uppercase">Today revenue</p>
      <p className="font-heading text-[38px] leading-none font-semibold">
        {shown ? "₦189,500" : "₦178,500"}
      </p>
      <p className="text-[11px] text-neutral-700">{shown ? 30 : 29} cars washed</p>
      <div className="flex h-1.5">
        <div className="w-[83%] bg-transfer" />
        <div className="w-[17%] bg-pos" />
      </div>
      <div className="flex flex-col gap-[5px] text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 bg-transfer" />
          <span className="flex-1">Transfer</span>
          <span>₦157,500</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 bg-pos" />
          <span className="flex-1">POS</span>
          <span>₦32,000</span>
        </div>
      </div>
    </div>
  );
}
