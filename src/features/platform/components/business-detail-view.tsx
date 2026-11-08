"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Blueprint } from "@/components/ui/blueprint";
import { buttonVariants } from "@/components/ui/button";
import { DateText } from "@/components/ui/date-text";
import { StatTile } from "@/components/ui/stat-tile";
import { PLATFORM_PATH } from "@/lib/auth/return-to";
import { formatNaira } from "@/lib/format/money";
import { EM_DASH } from "@/lib/format/text";

import { useBusiness } from "../hooks/use-platform";
import type { PlatformBusiness } from "../schemas/platform.schema";

import { BusinessActions } from "./business-actions";
import { BusinessStatusTag } from "./business-status-tag";

function StatusLine({ business }: { business: PlatformBusiness }) {
  if (business.status === "pending") {
    return (
      <>
        Registered <DateText format="receipt" value={business.createdAt} /> · waiting for approval
      </>
    );
  }
  if (business.status === "active") {
    return business.approvedAt ? (
      <>
        Approved <DateText format="receipt" value={business.approvedAt} />
      </>
    ) : null;
  }
  return (
    <>
      Suspended{" "}
      {business.statusChangedAt ? (
        <DateText format="receipt" value={business.statusChangedAt} />
      ) : null}
      {business.statusReason ? ` · ${business.statusReason}` : null}
    </>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="kicker">{label}</dt>
      <dd className="text-[14px] break-words">{children}</dd>
    </div>
  );
}

/**
 * One business for the super admin: status and what can be done about it, the 30-day figures, and
 * the details it registered with. Never its transactions or receipts (ADR-002).
 */
export function BusinessDetailView({ id }: { id: string }) {
  const query = useBusiness(id);
  const business = query.data;

  return (
    <div className="flex flex-col gap-7">
      <Link
        className={buttonVariants({ variant: "ghost", className: "self-start" })}
        href={PLATFORM_PATH}
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
        All businesses
      </Link>

      {query.isPending ? (
        <PageSkeleton />
      ) : query.isError && !business ? (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          title="This business didn't load."
        />
      ) : business ? (
        <>
          <div className="flex flex-col gap-3.5">
            <PageHeader showNewTransaction={false} title={business.name} />
            <p className="flex flex-wrap items-center gap-2.5 text-[13px] text-neutral-700">
              <BusinessStatusTag status={business.status} />
              <span>
                <StatusLine business={business} />
              </span>
            </p>
            <BusinessActions business={business} />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
            <StatTile
              helper="Paid transactions"
              label="Revenue · last 30 days"
              size="md"
              value={formatNaira(business.last30Days.revenueKobo)}
            />
            <StatTile
              helper="Paid transactions"
              label="Cars washed · last 30 days"
              size="md"
              value={business.last30Days.carsWashed}
            />
            <StatTile
              helper="Can sign in to the desk"
              label="Active staff"
              size="md"
              value={business.activeStaffCount}
            />
            <StatTile
              helper={business.lastSaleAt ? "Most recent paid sale" : "No sales yet"}
              label="Last sale"
              size="md"
              value={
                business.lastSaleAt ? (
                  <DateText format="short" value={business.lastSaleAt} />
                ) : (
                  EM_DASH
                )
              }
            />
          </div>

          <Blueprint as="section" aria-label="Business details" className="p-5">
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
              <Detail label="Phone">{business.phone || EM_DASH}</Detail>
              <Detail label="Address">{business.address || EM_DASH}</Detail>
              <Detail label="Owner">
                {business.registeredBy.name}
                <span className="block text-[13px] text-neutral-700">
                  {business.registeredBy.email}
                </span>
              </Detail>
              <Detail label="Registered">
                <DateText format="receipt" value={business.createdAt} />
              </Detail>
              <Detail label="Approved">
                {business.approvedAt ? (
                  <DateText format="receipt" value={business.approvedAt} />
                ) : (
                  "Not yet"
                )}
              </Detail>
            </dl>
          </Blueprint>
        </>
      ) : null}
    </div>
  );
}
