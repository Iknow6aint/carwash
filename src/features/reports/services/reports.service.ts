"use server";

import { z } from "zod";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES, withQuery } from "@/lib/api/endpoints";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  REPORT_RANGES,
  reportSchema,
  type Report,
  type ReportRange,
} from "../schemas/report.schema";

/** KPIs, revenue by day by method, services, staff and daily totals (reports.md). Any role. */
export async function getReport(range: ReportRange): Promise<ServiceResult<Report>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(
        withQuery(API_ROUTES.reports.summary, { range: z.enum(REPORT_RANGES).parse(range) }),
      ),
      (data) => reportSchema.parse(data),
    ),
  );
}
