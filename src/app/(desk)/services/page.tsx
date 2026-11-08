import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ServicesView } from "@/features/services/components/services-view";
import { requireStaffUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Services & prices" };

export default async function ServicesPage() {
  await requireStaffUser();
  return (
    <>
      <PageHeader title="Services & prices" />
      <ServicesView />
    </>
  );
}
