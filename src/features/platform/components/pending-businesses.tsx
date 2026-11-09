"use client";

import Link from "next/link";

import { ErrorState } from "@/components/feedback/error-state";
import { DateText } from "@/components/ui/date-text";
import { Skeleton } from "@/components/ui/skeleton";

import { useBusinessList } from "../hooks/use-platform";
import { businessDetailPath } from "../utils/paths";

import { BusinessStatusTag } from "./business-status-tag";

/** The newest registrations waiting for a decision, for the overview page. */
export function PendingBusinesses() {
  const list = useBusinessList({ q: "", status: "pending" });
  const businesses = list.data?.pages.flatMap((page) => page.items).slice(0, 5) ?? [];

  return (
    <section aria-label="Waiting for approval" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[25px]">Waiting for approval</h2>
        <Link
          className="text-[14px] text-accent hover:text-accent-700"
          href="/platform/businesses?status=pending"
        >
          View all
        </Link>
      </div>
      {list.isPending ? (
        <div className="flex flex-col gap-2" role="status" aria-label="Loading registrations">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : list.isError && !list.data ? (
        <ErrorState
          error={list.error}
          onRetry={() => void list.refetch()}
          title="Registrations didn't load."
        />
      ) : businesses.length === 0 ? (
        <p className="border border-divider px-4 py-5 text-[14px] text-neutral-700">
          No registrations are waiting. New car washes appear here as they register.
        </p>
      ) : (
        <div className="flex flex-col">
          {businesses.map((business) => (
            <Link
              className="flex flex-wrap items-center gap-3 border-b border-divider py-3 text-text no-underline hover:bg-neutral-100"
              href={businessDetailPath(business.id)}
              key={business.id}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{business.name}</span>
                <span className="block text-[12px] text-neutral-700">
                  {business.registeredBy.name} · {business.registeredBy.email}
                </span>
              </span>
              <span className="text-[12px] text-neutral-700">
                <DateText format="short" value={business.createdAt} />
              </span>
              <BusinessStatusTag status={business.status} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
