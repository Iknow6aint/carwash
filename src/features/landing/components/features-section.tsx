import { FileText, Search } from "lucide-react";

import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import { FeatureCard } from "./feature-card";
import { ACCENT_PHRASE, CONTAINER, SECTION_TITLE } from "./landing-classes";
import styles from "./landing.module.css";
import { QrCode } from "./qr-code";
import { SectionKicker } from "./section-kicker";
import { SpotlightGrid } from "./spotlight-grid";

const BODY = "m-0 text-[15px] text-neutral-800";
const CHOSEN = "border border-accent bg-accent-100 px-3 py-2 text-[14px]";
const REPORT_BARS = [55, 70, 48, 82, 66, 100, 74];

/** 02 Features: the bento of what the desk does. */
export function FeaturesSection() {
  return (
    <section
      className={cn(CONTAINER, "flex flex-col gap-7 pb-[clamp(72px,10vw,128px)]")}
      id="platform"
    >
      <SectionKicker label="Features" number="02" />
      <h2 className={cn(SECTION_TITLE, "max-w-[900px]")} data-reveal="80">
        One desk. <em className={ACCENT_PHRASE}>Every</em> payment.
      </h2>
      <SpotlightGrid className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3.5">
        <FeatureCard kicker="Record" reveal={0} wide>
          <h3 className="m-0 max-w-[520px] text-[32px]">Three taps from car to receipt.</h3>
          <p className={cn(BODY, "max-w-[560px]")}>
            Pick one service or several, pick how the customer paid, save. A numbered receipt is
            ready to print or share before the car leaves the bay.
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <span className={CHOSEN}>Full wash + Engine wash</span>
            <span aria-hidden="true" className="text-neutral-600">
              →
            </span>
            <span className={CHOSEN}>Bank transfer</span>
            <span aria-hidden="true" className="text-neutral-600">
              →
            </span>
            <span className="bg-accent px-3 py-2 text-[14px] font-semibold text-bg">
              Save &amp; show receipt
            </span>
          </div>
        </FeatureCard>
        <FeatureCard kicker="Search & combine" reveal={0}>
          <div aria-hidden="true" className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 border border-accent px-2.5 py-[7px] text-[13px]">
              <Search className="size-[13px] flex-none" strokeWidth={1.5} />
              eng
              <span className={cn(styles.caret, "h-3.5 w-px bg-accent")} />
            </div>
            <div className="flex justify-between bg-neutral-200 px-2.5 py-[7px] text-[13px]">
              <span>Engine wash</span>
              <span>₦5,000 +</span>
            </div>
          </div>
          <p className={BODY}>
            Find any service by typing a few letters. Add as many as the car needs; the total adds
            up as you go.
          </p>
        </FeatureCard>
        <FeatureCard kicker="Bulk upload" reveal={120}>
          <div
            aria-hidden="true"
            className="flex items-center gap-2.5 border border-dashed border-accent p-2.5 text-[13px]"
          >
            <FileText className="size-5 flex-none" strokeWidth={1.5} />
            <span className="flex-1">price-list.csv</span>
            <span className="text-accent">9 services</span>
          </div>
          <p className={BODY}>
            Upload your whole price list from a spreadsheet. Check the preview, confirm, and your
            menu is live.
          </p>
        </FeatureCard>
        <FeatureCard kicker="QR menu" reveal={240}>
          <div className="flex items-center gap-3.5">
            <div className="w-[76px] flex-none">
              <QrCode />
            </div>
            <p className="text-[13px] leading-[1.4] text-neutral-800">
              Print it for the gate or the waiting area.
            </p>
          </div>
          <p className={BODY}>
            Customers scan to see your services and prices on their phone. Change a price and the
            menu follows.
          </p>
        </FeatureCard>
        <FeatureCard kicker="Know" reveal={0}>
          <p className="font-heading text-[60px] leading-none font-semibold" data-count="184500">
            ₦184,500
          </p>
          <div aria-hidden="true" className="flex h-2">
            <div className="w-[70%] bg-transfer" />
            <div className="w-[30%] bg-pos" />
          </div>
          <p className={BODY}>
            Today&apos;s revenue, cars washed and the transfer and POS split, updated the moment a
            sale is saved.
          </p>
        </FeatureCard>
        <FeatureCard kicker="Control" reveal={120}>
          <div className="flex gap-1.5">
            <Tag tone="accent">Admin</Tag>
            <Tag tone="neutral">Cashier</Tag>
          </div>
          <p className={BODY}>
            Cashiers record payments. Admins set prices, manage staff and cancel entries, always
            with a reason that stays on record.
          </p>
        </FeatureCard>
        <FeatureCard kicker="Report" reveal={240}>
          <div aria-hidden="true" className="flex h-14 items-end gap-1">
            {REPORT_BARS.map((height, index) => (
              <div
                className={cn("flex-1", height === 100 ? "bg-accent" : "bg-neutral-400")}
                key={index}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <p className={BODY}>
            Daily totals, best-selling services and staff performance. Export to CSV for your
            accountant.
          </p>
        </FeatureCard>
      </SpotlightGrid>
    </section>
  );
}
