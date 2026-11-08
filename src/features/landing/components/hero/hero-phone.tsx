import Image from "next/image";

import { formatNaira, nairaToKobo } from "@/lib/format/money";
import { cn } from "@/lib/utils";

import { heroRevenueSplit, type HeroClock } from "../../utils/hero-frame";
import styles from "../landing.module.css";

const naira = (value: number) => formatNaira(nairaToKobo(value));

/** The owner's phone: today's revenue ticks up and a notification drops in for each sale. */
export function HeroPhone({
  clock,
  notificationShown,
}: {
  clock: HeroClock;
  notificationShown: boolean;
}) {
  const split = heroRevenueSplit(clock.revenue);
  return (
    <div
      className={cn(
        styles.enterPhone,
        "absolute right-6 bottom-0 w-[190px] border border-neutral-400 bg-black p-2 shadow-lg",
      )}
    >
      <div className="relative flex min-h-[244px] flex-col gap-2 overflow-hidden border border-divider bg-bg p-2.5">
        <div className="flex justify-between text-[9px] text-neutral-700">
          <span>5:42</span>
          <span>Owner · Adaeze</span>
        </div>
        <div
          className={cn(
            "absolute top-1.5 right-1.5 left-1.5 z-2 flex items-start gap-1.5 border border-neutral-400 bg-neutral-200 p-2 transition-all duration-500 ease-(--cw-ease)",
            !notificationShown && "-translate-y-[120%] opacity-0",
          )}
        >
          <Image
            alt=""
            className="size-4 flex-none object-contain"
            height={16}
            src="/brand/cartory-mark.png"
            width={16}
          />
          <div className="text-[9.5px] leading-[1.3]">
            <p className="font-semibold">Tunde recorded ₦11,000</p>
            <p className="text-neutral-700">Full wash + Engine wash · Transfer</p>
          </div>
        </div>
        <p className="mt-1.5 text-[9px] tracking-[0.1em] text-accent uppercase">Today revenue</p>
        <p className="font-heading text-[34px] leading-none font-semibold">
          {naira(clock.revenue)}
        </p>
        <p className="text-[10px] text-neutral-700">{clock.cars} cars washed</p>
        <div className="mt-1 flex h-1.5">
          <div
            className="bg-transfer transition-[width] duration-700 ease-(--cw-ease)"
            style={{ width: `${split.transferShare * 100}%` }}
          />
          <div
            className="bg-pos transition-[width] duration-700 ease-(--cw-ease)"
            style={{ width: `${split.posShare * 100}%` }}
          />
        </div>
        <div className="flex flex-col gap-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 bg-transfer" />
            <span className="flex-1">Transfer</span>
            <span>{naira(split.transfer)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 bg-pos" />
            <span className="flex-1">POS</span>
            <span>{naira(split.pos)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
