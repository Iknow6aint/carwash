"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { unwrapServiceResult } from "@/lib/api/service-result";

import type { DashboardPeriod } from "../schemas/dashboard.schema";
import { getDashboard } from "../services/dashboard.service";

/** The dashboard for a period; the previous period stays on screen while the next loads. */
export function useDashboard(period: DashboardPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(period),
    queryFn: async () => unwrapServiceResult(await getDashboard(period)),
    placeholderData: keepPreviousData,
  });
}
