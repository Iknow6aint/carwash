import type { NextRequest } from "next/server";

import { streamCsvExport } from "@/lib/api/csv-export";
import { API_ROUTES } from "@/lib/api/endpoints";

/** `GET /api/export/transactions?q&range&from&to&method&status` → transactions CSV (transactions.md). */
export async function GET(request: NextRequest) {
  return streamCsvExport(request, {
    route: API_ROUTES.transactions.export,
    allowedParams: ["q", "range", "from", "to", "method", "status"],
    fallbackFileName: "transactions.csv",
  });
}
