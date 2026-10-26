import { StatTileSkeleton } from "@/components/ui/stat-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table";

/** Route-level loading shape: header, KPI row, table. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading page" className="flex flex-col gap-7" role="status">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>
      <TableSkeleton columns={6} />
    </div>
  );
}
