"use server";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES } from "@/lib/api/endpoints";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  businessSettingsSchema,
  updateBusinessSettingsSchema,
  type BusinessSettings,
  type UpdateBusinessSettingsInput,
} from "../schemas/settings.schema";

/** Business details (settings.md). Any role reads; only admins write. */
export async function getBusinessSettings(): Promise<ServiceResult<BusinessSettings>> {
  return executeBackendService(async () =>
    mapBackendData(authenticatedBackendRequest(API_ROUTES.settings.business), (data) =>
      businessSettingsSchema.parse(data),
    ),
  );
}

/** Saves business details (admin). Audit-logged by the API as `settings.updated`. */
export async function updateBusinessSettings(
  input: UpdateBusinessSettingsInput,
): Promise<ServiceResult<BusinessSettings>> {
  return executeBackendService(async () => {
    const body = updateBusinessSettingsSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.settings.business, { method: "PATCH", body }),
      (data) => businessSettingsSchema.parse(data),
    );
  });
}
