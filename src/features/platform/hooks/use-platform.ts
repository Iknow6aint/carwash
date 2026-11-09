"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import {
  unwrapServiceResult,
  unwrapServiceSuccess,
  type ServiceResult,
} from "@/lib/api/service-result";

import type {
  ListPlatformTransactionsQuery,
  PlatformBusiness,
  UpdatePlatformSettingsInput,
} from "../schemas/platform.schema";
import {
  approveBusiness,
  getBusiness,
  getPlatformNotifications,
  getPlatformOverview,
  getPlatformRevenue,
  getPlatformSettings,
  listBusinesses,
  listPlatformTransactions,
  reactivateBusiness,
  suspendBusiness,
  updatePlatformSettings,
} from "../services/platform.service";
import { businessFiltersToQuery, type BusinessFilters } from "../utils/business-filters";

/** "Show 40 more" pages through the list 40 at a time. */
export const BUSINESSES_PAGE_SIZE = 40;

export function usePlatformOverview() {
  return useQuery({
    queryKey: queryKeys.platform.overview(),
    queryFn: async () => unwrapServiceResult(await getPlatformOverview()),
  });
}

/** The filtered list, page by page. The previous results stay on screen while filters change. */
export function useBusinessList(filters: BusinessFilters) {
  const query = businessFiltersToQuery(filters);
  return useInfiniteQuery({
    queryKey: queryKeys.platform.businesses(query),
    queryFn: async ({ pageParam }) =>
      unwrapServiceResult(
        await listBusinesses({ ...query, page: pageParam, limit: BUSINESSES_PAGE_SIZE }),
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pageInfo.page < last.pageInfo.totalPages ? last.pageInfo.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: queryKeys.platform.business(id),
    queryFn: async () => unwrapServiceResult(await getBusiness(id)),
  });
}

/**
 * A status change: the business's page shows the answer at once, and the overview counts and
 * every list (which filter by status) refresh.
 */
function usePlatformMutation<TVariables>(
  call: (variables: TVariables) => Promise<ServiceResult<PlatformBusiness>>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: TVariables) => unwrapServiceSuccess(await call(variables)),
    onSuccess: ({ data }) => {
      client.setQueryData(queryKeys.platform.business(data.id), data);
      void client.invalidateQueries({ queryKey: queryKeys.platform.all });
    },
  });
}

export function useApproveBusiness() {
  return usePlatformMutation((id: string) => approveBusiness(id));
}

export function useSuspendBusiness() {
  return usePlatformMutation((variables: { id: string; reason: string }) =>
    suspendBusiness(variables.id, variables.reason),
  );
}

export function useReactivateBusiness() {
  return usePlatformMutation((id: string) => reactivateBusiness(id));
}

/** Platform-wide transaction metadata, newest first. */
export function usePlatformTransactions(filters: ListPlatformTransactionsQuery) {
  return useQuery({
    queryKey: queryKeys.platform.transactions(filters),
    queryFn: async () => unwrapServiceResult(await listPlatformTransactions(filters)),
    placeholderData: keepPreviousData,
  });
}

export function usePlatformRevenue() {
  return useQuery({
    queryKey: queryKeys.platform.revenue(),
    queryFn: async () => unwrapServiceResult(await getPlatformRevenue()),
  });
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: queryKeys.platform.settings(),
    queryFn: async () => unwrapServiceResult(await getPlatformSettings()),
    staleTime: 60_000,
  });
}

export function useUpdatePlatformSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdatePlatformSettingsInput) =>
      unwrapServiceSuccess(await updatePlatformSettings(input)),
    onSuccess: ({ data }) => {
      client.setQueryData(queryKeys.platform.settings(), data);
      void client.invalidateQueries({ queryKey: queryKeys.platform.all });
    },
  });
}

export function usePlatformNotifications() {
  return useQuery({
    queryKey: queryKeys.platform.notifications(),
    queryFn: async () => unwrapServiceResult(await getPlatformNotifications()),
  });
}
