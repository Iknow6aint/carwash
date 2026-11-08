"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { StatTile, StatTileSkeleton } from "@/components/ui/stat-tile";
import { formatNaira } from "@/lib/format/money";
import { plural } from "@/lib/format/text";

import { usePlatformOverview } from "../hooks/use-platform";

/** The platform at a glance: registrations by status, and paid sales across every business. */
export function PlatformOverview() {
  const overview = usePlatformOverview();
  const data = overview.data;

  if (overview.isError && !data) {
    return (
      <ErrorState
        error={overview.error}
        onRetry={() => void overview.refetch()}
        title="The overview didn't load."
      />
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
      {data ? (
        <>
          <StatTile
            helper="Registrations to review"
            label="Waiting for approval"
            size="md"
            value={data.businesses.pending}
          />
          <StatTile
            helper={`${plural(data.businesses.total, "business", "businesses")} registered`}
            label="Active businesses"
            size="md"
            value={data.businesses.active}
          />
          <StatTile
            helper="Staff can't use the desk"
            label="Suspended"
            size="md"
            value={data.businesses.suspended}
          />
          <StatTile
            helper={`${plural(data.last30Days.carsWashed, "car")} washed`}
            label="Revenue · last 30 days"
            size="md"
            value={formatNaira(data.last30Days.revenueKobo)}
          />
        </>
      ) : (
        <>
          <StatTileSkeleton size="md" />
          <StatTileSkeleton size="md" />
          <StatTileSkeleton size="md" />
          <StatTileSkeleton size="md" />
        </>
      )}
    </div>
  );
}
