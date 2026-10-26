import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ServicesView } from "@/features/services/components/services-view";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Services & prices" };

export default async function ServicesPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Services & prices" />
      <ServicesView />
    </>
  );
}
