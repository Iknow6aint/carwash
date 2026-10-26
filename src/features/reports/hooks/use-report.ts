"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { unwrapServiceResult } from "@/lib/api/service-result";

import type { ReportRange } from "../schemas/report.schema";
import { getReport } from "../services/reports.service";

/** The report for a range; the previous range stays on screen while the next loads. */
export function useReport(range: ReportRange) {
  return useQuery({
    queryKey: queryKeys.reports.summary(range),
    queryFn: async () => unwrapServiceResult(await getReport(range)),
    placeholderData: keepPreviousData,
  });
}
