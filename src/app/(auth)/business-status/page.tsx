import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BusinessStatusCard } from "@/features/auth/components/business-status-card";
import { AuthFrame } from "@/features/auth/components/auth-frame";
import { BUSINESS_STATUS_PATH, landingPath } from "@/lib/auth/return-to";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Business status" };

/**
 * Where staff of a pending or suspended business wait instead of the desk. Anyone else (super
 * admins, staff whose business is active) is sent on to where they belong.
 */
export default async function BusinessStatusPage() {
  const user = await requireUser();
  if (landingPath(user) !== BUSINESS_STATUS_PATH || !user.business) redirect(landingPath(user));
  return (
    <AuthFrame>
      <BusinessStatusCard business={user.business} />
    </AuthFrame>
  );
}
