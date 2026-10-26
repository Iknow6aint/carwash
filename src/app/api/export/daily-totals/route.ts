import type { NextRequest } from "next/server";

import { streamCsvExport } from "@/lib/api/csv-export";
import { API_ROUTES } from "@/lib/api/endpoints";

/** `GET /api/export/daily-totals?range` → daily totals CSV, newest day first (reports.md). */
export async function GET(request: NextRequest) {
  return streamCsvExport(request, {
    route: API_ROUTES.reports.dailyTotalsExport,
    allowedParams: ["range"],
    fallbackFileName: "daily-totals.csv",
  });
}
