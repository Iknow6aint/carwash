import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { PendingBusinesses } from "@/features/platform/components/pending-businesses";
import { PlatformOverview } from "@/features/platform/components/platform-overview";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Platform overview" };

/** The super admin's landing: platform figures and the registrations waiting for review. */
export default async function PlatformPage() {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Platform overview" />
      <PlatformOverview />
      <div className="flex flex-wrap gap-2">
        <Link className={buttonVariants({ variant: "secondary" })} href="/platform/businesses">
          All businesses
        </Link>
        <Link
          className={buttonVariants({ variant: "secondary" })}
          href="/platform/businesses?status=pending"
        >
          Registrations to review
        </Link>
      </div>
      <PendingBusinesses />
    </>
  );
}
