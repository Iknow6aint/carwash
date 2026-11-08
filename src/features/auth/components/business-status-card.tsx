import { Corners } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { BUSINESS_STATUS_PATH } from "@/lib/auth/return-to";

import type { BusinessSummary } from "../schemas/auth.schema";

import { AuthHeading } from "./auth-frame";

/**
 * Why the desk is closed: waiting for a super admin's approval, or suspended. A waiting owner can
 * check again (a full reload, so the server reads the business afresh) or sign out.
 */
export function BusinessStatusCard({ business }: { business: BusinessSummary }) {
  const pending = business.status === "pending";
  return (
    <div className="blueprint flex w-[min(400px,100%)] flex-col gap-3.5 border border-divider p-5 sm:p-7">
      <Corners />
      {pending ? (
        <AuthHeading
          description={`We've received ${business.name}. You can use the desk as soon as it's approved.`}
          title="Waiting for approval"
        />
      ) : (
        <AuthHeading
          description="Contact support to reopen it."
          title={`${business.name} is suspended`}
        />
      )}
      <div className="flex flex-wrap items-center gap-4">
        {pending ? (
          // A plain link reloads the page, so an approval shows up at once.
          <a className={buttonVariants({ variant: "secondary" })} href={BUSINESS_STATUS_PATH}>
            Check again
          </a>
        ) : null}
        <SignOutButton />
      </div>
    </div>
  );
}
