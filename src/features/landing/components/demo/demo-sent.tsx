"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DemoRequest } from "../../utils/demo-request";
import styles from "../landing.module.css";

/**
 * After "Request a demo": WhatsApp has opened with the message typed in. The booking only
 * happens once the visitor sends it, so the copy says so and offers to open it again.
 */
export function DemoSent({ request, whatsAppUrl }: { request: DemoRequest; whatsAppUrl: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The form is gone; move focus to what replaced it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className={cn(styles.appear, "flex flex-col gap-2.5")}>
      <p className="text-[11px] tracking-[0.12em] text-accent uppercase">Almost done</p>
      <h3 className="m-0 text-[30px]" ref={headingRef} tabIndex={-1}>
        Thanks, {request.name}.
      </h3>
      <p className="text-[15px] leading-[1.55] text-neutral-800">
        Send the WhatsApp message we just opened to finish booking. We&apos;ll call {request.phone}{" "}
        within one working day to set a time for {request.business}.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <a
          className={buttonVariants({ variant: "secondary" })}
          href={whatsAppUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open WhatsApp again
        </a>
        <Link className={buttonVariants({ variant: "secondary" })} href="/login">
          Try the payment desk now
        </Link>
      </div>
    </div>
  );
}
