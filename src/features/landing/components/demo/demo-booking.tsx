import Link from "next/link";

import { Blueprint } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { publicEnv } from "@/config/env";

import { DemoForm } from "./demo-form";

/**
 * The booking card. With `NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER` set it holds the form (which hands
 * the request to WhatsApp); without it, no form at all, just a way to sign in.
 */
export function DemoBooking() {
  const whatsAppNumber = publicEnv.NEXT_PUBLIC_DEMO_WHATSAPP_NUMBER;
  return (
    <Blueprint className="flex flex-col gap-3.5 p-7" data-reveal="150">
      {whatsAppNumber ? (
        <DemoForm whatsAppNumber={whatsAppNumber} />
      ) : (
        <div className="flex flex-col gap-3.5">
          <h3 className="m-0 text-[30px]">Book a demo</h3>
          <p className="text-[15px] leading-[1.55] text-neutral-800">Demo booking opens soon.</p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              className={buttonVariants({ variant: "secondary", className: "self-start" })}
              href="/register"
            >
              Register your car wash
            </Link>
            <Link
              className={buttonVariants({ variant: "secondary", className: "self-start" })}
              href="/login"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </Blueprint>
  );
}
