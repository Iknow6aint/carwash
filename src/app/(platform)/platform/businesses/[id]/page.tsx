import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BusinessDetailView } from "@/features/platform/components/business-detail-view";
import { idSchema } from "@/lib/api/schema-helpers";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Business" };

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  return <BusinessDetailView id={id.data} />;
}
