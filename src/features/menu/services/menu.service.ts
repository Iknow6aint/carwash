"use server";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES } from "@/lib/api/endpoints";
import { idSchema } from "@/lib/api/schema-helpers";
import { backendRequest } from "@/lib/api/server-api-client";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";

import { publicMenuSchema, type PublicMenu } from "../schemas/menu.schema";

/**
 * The public QR menu (menu.md). No session: a customer's phone calls this by business id.
 * A pending, suspended or unknown business answers 404 `MENU_NOT_FOUND`.
 */
export async function getPublicMenu(businessId: string): Promise<ServiceResult<PublicMenu>> {
  return executeBackendService(async () =>
    mapBackendData(backendRequest(API_ROUTES.menu.show(idSchema.parse(businessId))), (data) =>
      publicMenuSchema.parse(data),
    ),
  );
}
