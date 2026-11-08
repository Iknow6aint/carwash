import Image from "next/image";

import { cn } from "@/lib/utils";

import { ACCENT_PHRASE, CONTAINER, SECTION_Y } from "../landing-classes";

import { DemoBooking } from "./demo-booking";

/** Book a demo: the full logo on black, the pitch and the booking card. */
export function DemoSection() {
  return (
    <section className="border-t border-divider bg-black" id="demo">
      <div
        className={cn(
          CONTAINER,
          SECTION_Y,
          "grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(40px,6vw,96px)]",
        )}
      >
        <div className="flex flex-col gap-5">
          <Image
            alt="Cartory Wash"
            className="h-auto w-full max-w-[440px]"
            data-reveal="0"
            height={1530}
            sizes="(min-width: 480px) 440px, 100vw"
            src="/brand/cartory-logo.png"
            width={2630}
          />
          <h2
            className="m-0 font-heading text-[clamp(40px,5vw,68px)] leading-[0.98] font-semibold tracking-[-0.015em]"
            data-reveal="100"
          >
            See your car wash <em className={ACCENT_PHRASE}>in numbers.</em>
          </h2>
          <p
            className="max-w-[480px] text-[17px] leading-[1.55] text-neutral-800"
            data-reveal="200"
          >
            We&apos;ll upload your price list, print your QR menu and walk your team through their
            first sale on a 30-minute call.
          </p>
        </div>
        <DemoBooking />
      </div>
    </section>
  );
}
