"use server";

import { z } from "zod";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES, withQuery } from "@/lib/api/endpoints";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  DASHBOARD_PERIODS,
  dashboardSchema,
  type Dashboard,
  type DashboardPeriod,
} from "../schemas/dashboard.schema";

/** Today / this week / this month at a glance (reports.md `GET /dashboard`). Any role. */
export async function getDashboard(period: DashboardPeriod): Promise<ServiceResult<Dashboard>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(
        withQuery(API_ROUTES.dashboard.summary, {
          period: z.enum(DASHBOARD_PERIODS).parse(period),
        }),
      ),
      (data) => dashboardSchema.parse(data),
    ),
  );
}
