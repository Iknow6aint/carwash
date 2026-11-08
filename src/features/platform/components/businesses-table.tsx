"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DateText } from "@/components/ui/date-text";
import { MoneyText } from "@/components/ui/money-text";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { PlatformBusiness } from "../schemas/platform.schema";
import { businessDetailPath } from "../utils/paths";

import { BusinessStatusTag } from "./business-status-tag";

/**
 * Businesses with their owner, status and 30-day figures. A click anywhere on a row opens the
 * business; the name is also a link so keyboards and new tabs work.
 */
export function BusinessesTable({
  businesses,
  busy = false,
}: {
  businesses: readonly PlatformBusiness[];
  /** Dims the rows while new results load. */
  busy?: boolean;
}) {
  const router = useRouter();
  return (
    <TableContainer className={cn("transition-opacity", busy && "opacity-60")} label="Businesses">
      <Table aria-busy={busy || undefined}>
        <TableHeader>
          <tr>
            <TableHead>Business</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Staff</TableHead>
            <TableHead numeric>Cars · 30 days</TableHead>
            <TableHead numeric>Revenue · 30 days</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {businesses.map((business) => {
            const href = businessDetailPath(business.id);
            return (
              <TableRow interactive key={business.id} onClick={() => router.push(href)}>
                <TableCell>
                  <Link
                    className="font-medium text-text no-underline hover:underline"
                    href={href}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {business.name}
                  </Link>
                  <span className="block text-[12px] text-neutral-700">{business.phone}</span>
                </TableCell>
                <TableCell>
                  {business.registeredBy.name}
                  <span className="block text-[12px] text-neutral-700">
                    {business.registeredBy.email}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <DateText format="short" value={business.createdAt} />
                </TableCell>
                <TableCell>
                  <BusinessStatusTag status={business.status} />
                </TableCell>
                <TableCell numeric>{business.activeStaffCount}</TableCell>
                <TableCell numeric>{business.last30Days.carsWashed}</TableCell>
                <TableCell className="font-medium" numeric>
                  <MoneyText kobo={business.last30Days.revenueKobo} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
