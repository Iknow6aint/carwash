"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table";
import { useDebouncedValue } from "@/features/transactions/hooks/use-debounced-value";
import { plural } from "@/lib/format/text";

import { BUSINESSES_PAGE_SIZE, useBusinessList } from "../hooks/use-platform";
import {
  businessFiltersToSearchParams,
  isUnfiltered,
  type BusinessFilters,
} from "../utils/business-filters";

import { BusinessesFilters } from "./businesses-filters";
import { BusinessesTable } from "./businesses-table";

/** Debounce for the search box (PROJECT_GUIDE §8). */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Businesses: search, status, the count, the table and "Show 40 more".
 *
 * Filters live in the URL: the page reads them on load (`initialFilters`) and every change is
 * written back with `router.replace`, so a refresh or a shared link shows the same list.
 */
export function BusinessesView({ initialFilters }: { initialFilters: BusinessFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState(initialFilters.status);
  const [search, setSearch] = useState(initialFilters.q);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const filters = useMemo<BusinessFilters>(
    () => ({ status, q: debouncedSearch }),
    [status, debouncedSearch],
  );

  useEffect(() => {
    const next = businessFiltersToSearchParams(filters).toString();
    if (next !== window.location.search.replace(/^\?/, "")) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [filters, pathname, router]);

  const list = useBusinessList(filters);
  const businesses = list.data?.pages.flatMap((page) => page.items) ?? [];
  const total = list.data?.pages[0]?.pageInfo.total;

  return (
    <section aria-label="Businesses" className="flex flex-col gap-3.5">
      <BusinessesFilters
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        search={search}
        status={status}
      />

      {list.isPending ? (
        <TableSkeleton columns={7} label="Loading businesses" />
      ) : list.isError && !list.data ? (
        <ErrorState
          error={list.error}
          onRetry={() => void list.refetch()}
          title="Businesses didn't load."
        />
      ) : (
        <>
          <p aria-live="polite" className="text-[13px] text-neutral-700">
            {total === undefined ? null : plural(total, "business", "businesses")}
          </p>
          {businesses.length === 0 ? (
            isUnfiltered(filters) ? (
              <EmptyState
                description="Car washes show here as soon as they register."
                title="No businesses yet."
              />
            ) : (
              <EmptyState title="No businesses match these filters." />
            )
          ) : (
            <BusinessesTable businesses={businesses} busy={list.isPlaceholderData} />
          )}
          {list.isFetchNextPageError ? (
            <ErrorState
              error={list.error}
              onRetry={() => void list.fetchNextPage()}
              title="More businesses didn't load."
            />
          ) : null}
          {list.hasNextPage ? (
            <Button
              className="self-center"
              loading={list.isFetchingNextPage}
              onClick={() => void list.fetchNextPage()}
              variant="secondary"
            >
              Show {BUSINESSES_PAGE_SIZE} more
            </Button>
          ) : null}
        </>
      )}
    </section>
  );
}
