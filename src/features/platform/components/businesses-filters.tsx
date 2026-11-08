"use client";

import { Input } from "@/components/ui/input";
import { Seg, type SegOption } from "@/components/ui/seg";

import { BUSINESS_SEARCH_MAX_LENGTH } from "../schemas/platform.schema";
import type { BusinessFilters } from "../utils/business-filters";

const STATUS_OPTIONS: readonly SegOption<BusinessFilters["status"]>[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

/** Search and the status segments for the Businesses list. */
export function BusinessesFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  status: BusinessFilters["status"];
  onStatusChange: (status: BusinessFilters["status"]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Input
        aria-label="Search businesses"
        className="w-auto min-w-0 flex-[1_1_260px]"
        maxLength={BUSINESS_SEARCH_MAX_LENGTH}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search business, phone, owner or email"
        type="search"
        value={search}
      />
      <Seg label="Status" onChange={onStatusChange} options={STATUS_OPTIONS} value={status} />
    </div>
  );
}
