"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Service } from "@/features/services/schemas/service.schema";
import { formatNaira } from "@/lib/format/money";
import { cn } from "@/lib/utils";

const tileClass =
  "flex min-h-24 flex-col items-start gap-1.5 border p-4 text-left text-text transition-colors hover:border-accent";

/** Step 01: one tile per active service with its name and price. The chosen tile is accented. */
export function ServiceTiles({
  services,
  isPending,
  error,
  onRetry,
  selectedId,
  onSelect,
  labelledBy,
}: {
  services: readonly Service[] | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (service: Service) => void;
  labelledBy: string;
}) {
  if (isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading services"
        className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5"
        role="status"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton className="min-h-24" key={index} />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={onRetry} title="Services didn't load." />;
  if (!services?.length) {
    return (
      <EmptyState
        className="items-start py-4 text-left"
        description="An admin can add them in Services & prices."
        title="No services to sell yet."
      />
    );
  }
  return (
    <div
      aria-labelledby={labelledBy}
      className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5"
      role="group"
    >
      {services.map((service) => {
        const selected = service.id === selectedId;
        return (
          <button
            aria-pressed={selected}
            className={cn(
              tileClass,
              selected ? "border-accent bg-accent-100" : "border-divider bg-transparent",
            )}
            key={service.id}
            onClick={() => onSelect(service)}
            type="button"
          >
            <span className="text-[15px] font-medium">{service.name}</span>
            <span className="mt-auto font-heading text-[24px] leading-none font-semibold tabular-nums">
              {formatNaira(service.priceKobo)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
