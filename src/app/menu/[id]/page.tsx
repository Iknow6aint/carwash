import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicMenuView } from "@/features/menu/components/public-menu-view";
import { getPublicMenu } from "@/features/menu/services/menu.service";
import { idSchema } from "@/lib/api/schema-helpers";

export const metadata: Metadata = {
  title: "Services & prices",
  robots: { index: false, follow: false },
};

/**
 * The public QR menu, opened from the code a business prints. No session. A pending, suspended or
 * unknown business is a 404, exactly like a missing page.
 */
export default async function PublicMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const result = await getPublicMenu(id.data);
  if (!result.ok) {
    if (result.error.kind === "not-found") notFound();
    throw new Error(result.error.message);
  }
  return <PublicMenuView menu={result.data} />;
}
