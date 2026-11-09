import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { BusinessesView } from "@/features/platform/components/businesses-view";
import { parseBusinessFilters } from "@/features/platform/utils/business-filters";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Businesses" };

/** The platform's business list; the platform landing is the overview. */
export default async function PlatformBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Businesses" />
      <BusinessesView initialFilters={parseBusinessFilters(await searchParams)} />
    </>
  );
}
