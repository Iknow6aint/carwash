"use server";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES, withQuery } from "@/lib/api/endpoints";
import { idSchema } from "@/lib/api/schema-helpers";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  listBusinessesQuerySchema,
  listPlatformTransactionsQuerySchema,
  platformBusinessPageSchema,
  platformBusinessSchema,
  platformNotificationSchema,
  platformOverviewSchema,
  platformRevenueSchema,
  platformSettingsSchema,
  platformTransactionPageSchema,
  suspendBusinessSchema,
  updatePlatformSettingsSchema,
  type ListBusinessesQuery,
  type ListPlatformTransactionsQuery,
  type PlatformBusiness,
  type PlatformBusinessPage,
  type PlatformNotification,
  type PlatformOverview,
  type PlatformRevenue,
  type PlatformSettings,
  type PlatformTransactionPage,
  type UpdatePlatformSettingsInput,
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

/** Platform-wide transaction metadata (no customer or vehicle data). */
export async function listPlatformTransactions(
  query: ListPlatformTransactionsQuery,
): Promise<ServiceResult<PlatformTransactionPage>> {
  return executeBackendService(async () => {
    const parsed = listPlatformTransactionsQuerySchema.parse(query);
    return mapBackendData(
      authenticatedBackendRequest(
        withQuery(API_ROUTES.platform.transactions, {
          status: parsed.status === "all" ? undefined : parsed.status,
          method: parsed.method === "all" ? undefined : parsed.method,
          q: parsed.q || undefined,
          page: parsed.page,
          limit: parsed.limit,
        }),
      ),
      (data) => platformTransactionPageSchema.parse(data),
    );
  });
}

/** Calculated platform fees over 12 months plus the top businesses by fees. */
export async function getPlatformRevenue(): Promise<ServiceResult<PlatformRevenue>> {
  return executeBackendService(async () =>
    mapBackendData(authenticatedBackendRequest(API_ROUTES.platform.revenue), (data) =>
      platformRevenueSchema.parse(data),
    ),
  );
}

export async function getPlatformSettings(): Promise<ServiceResult<PlatformSettings>> {
  return executeBackendService(async () =>
    mapBackendData(authenticatedBackendRequest(API_ROUTES.platform.settings), (data) =>
      platformSettingsSchema.parse(data),
    ),
  );
}

export async function updatePlatformSettings(
  input: UpdatePlatformSettingsInput,
): Promise<ServiceResult<PlatformSettings>> {
  return executeBackendService(async () => {
    const body = updatePlatformSettingsSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.platform.settings, { method: "PATCH", body }),
      (data) => platformSettingsSchema.parse(data),
    );
  });
}

export async function getPlatformNotifications(): Promise<ServiceResult<PlatformNotification[]>> {
  return executeBackendService(async () =>
    mapBackendData(authenticatedBackendRequest(API_ROUTES.platform.notifications), (data) =>
      platformNotificationSchema.array().parse(data),
    ),
  );
}
