"use server";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES, withQuery } from "@/lib/api/endpoints";
import { idSchema } from "@/lib/api/schema-helpers";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  createServiceSchema,
  importServicesResultSchema,
  importServicesSchema,
  serviceListSchema,
  serviceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type ImportServicesInput,
  type ImportServicesResult,
  type Service,
  type UpdateServiceInput,
} from "../schemas/service.schema";

/** Services & prices (services.md). Any role reads; admins add, edit, deactivate. */

/**
 * Services ordered by `sortOrder`, then name.
 *
 * @param filters - `active: true` for the New transaction tiles; omit for every service.
 */
export async function listServices(
  filters: { active?: boolean } = {},
): Promise<ServiceResult<Service[]>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(
        withQuery(API_ROUTES.services.list, {
          active: filters.active === undefined ? undefined : String(filters.active),
        }),
      ),
      (data) => serviceListSchema.parse(data),
    ),
  );
}

/** Adds a service (admin). Names are unique ignoring case (`SERVICE_NAME_TAKEN`). */
export async function createService(input: CreateServiceInput): Promise<ServiceResult<Service>> {
  return executeBackendService(async () => {
    const body = createServiceSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.services.list, { method: "POST", body }),
      (data) => serviceSchema.parse(data),
    );
  });
}

/**
 * Imports a price list in one transaction (admin): existing names get the new price, new names
 * are added active. Inactive services keep their status.
 */
export async function importServices(
  input: ImportServicesInput,
): Promise<ServiceResult<ImportServicesResult>> {
  return executeBackendService(async () => {
    const body = importServicesSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.services.import, { method: "POST", body }),
      (data) => importServicesResultSchema.parse(data),
    );
  });
}

/** Renames, re-prices, deactivates or reactivates a service (admin). Past receipts never change. */
export async function updateService(
  id: string,
  input: UpdateServiceInput,
): Promise<ServiceResult<Service>> {
  return executeBackendService(async () => {
    const body = updateServiceSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.services.detail(idSchema.parse(id)), {
        method: "PATCH",
        body,
      }),
      (data) => serviceSchema.parse(data),
    );
  });
}
