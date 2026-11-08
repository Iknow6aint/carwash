import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { BusinessesView } from "@/features/platform/components/businesses-view";
import { PlatformOverview } from "@/features/platform/components/platform-overview";
import { parseBusinessFilters } from "@/features/platform/utils/business-filters";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Businesses" };

export default async function PlatformPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSuperAdmin();
  return (
    <>
      <PageHeader showNewTransaction={false} title="Businesses" />
      <PlatformOverview />
      <BusinessesView initialFilters={parseBusinessFilters(await searchParams)} />
    </>
  );
}
