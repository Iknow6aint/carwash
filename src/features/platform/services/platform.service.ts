"use server";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES, withQuery } from "@/lib/api/endpoints";
import { idSchema } from "@/lib/api/schema-helpers";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  listBusinessesQuerySchema,
  platformBusinessPageSchema,
  platformBusinessSchema,
  platformOverviewSchema,
  suspendBusinessSchema,
  type ListBusinessesQuery,
  type PlatformBusiness,
  type PlatformBusinessPage,
  type PlatformOverview,
} from "../schemas/platform.schema";

/**
 * The platform (platform.md, super admin only): registrations, approval and suspension, and each
 * business's summary figures. Never a business's transactions, receipts or reports.
 */

const parseBusiness = (data: unknown) => platformBusinessSchema.parse(data);

/** Businesses by status, and paid figures across every business for the last 30 days. */
export async function getPlatformOverview(): Promise<ServiceResult<PlatformOverview>> {
  return executeBackendService(async () =>
    mapBackendData(authenticatedBackendRequest(API_ROUTES.platform.overview), (data) =>
      platformOverviewSchema.parse(data),
    ),
  );
}

/** One page of businesses, newest registration first. */
export async function listBusinesses(
  query: ListBusinessesQuery,
): Promise<ServiceResult<PlatformBusinessPage>> {
  return executeBackendService(async () => {
    const params = listBusinessesQuerySchema.parse(query);
    return mapBackendData(
      authenticatedBackendRequest(withQuery(API_ROUTES.platform.businesses.list, params)),
      (data) => platformBusinessPageSchema.parse(data),
    );
  });
}

/** One business with its figures. `BUSINESS_NOT_FOUND` for an unknown id. */
export async function getBusiness(id: string): Promise<ServiceResult<PlatformBusiness>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(API_ROUTES.platform.businesses.detail(idSchema.parse(id))),
      parseBusiness,
    ),
  );
}

/** Opens the desk for a pending business. `BUSINESS_STATUS_CONFLICT` from any other status. */
export async function approveBusiness(id: string): Promise<ServiceResult<PlatformBusiness>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(API_ROUTES.platform.businesses.approve(idSchema.parse(id)), {
        method: "POST",
      }),
      parseBusiness,
    ),
  );
}

/**
 * Suspends an active business, or declines a pending registration, with a reason that stays on
 * the record. Its staff are locked out on their next request.
 */
export async function suspendBusiness(
  id: string,
  reason: string,
): Promise<ServiceResult<PlatformBusiness>> {
  return executeBackendService(async () => {
    const body = suspendBusinessSchema.parse({ reason });
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.platform.businesses.suspend(idSchema.parse(id)), {
        method: "POST",
        body,
      }),
      parseBusiness,
    );
  });
}

/** Reopens a suspended business. */
export async function reactivateBusiness(id: string): Promise<ServiceResult<PlatformBusiness>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(API_ROUTES.platform.businesses.reactivate(idSchema.parse(id)), {
        method: "POST",
      }),
      parseBusiness,
    ),
  );
}
