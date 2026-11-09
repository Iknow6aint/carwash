import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { QrMenuView } from "@/features/qr-menu/components/qr-menu-view";
import { LOGIN_PATH } from "@/lib/auth/return-to";
import { requireStaffUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "QR menu" };

/** The public origin behind Vercel/Render (falls back to the local dev server). */
async function menuUrlFor(businessId: string): Promise<string> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol =
    incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}/menu/${businessId}`;
}

export default async function QrMenuPage() {
  const user = await requireStaffUser();
  const business = user.business;
  if (!business) redirect(LOGIN_PATH);
  return (
    <>
      <PageHeader title="QR menu" />
      <QrMenuView businessName={business.name} menuUrl={await menuUrlFor(business.id)} />
    </>
  );
}
