"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { unwrapServiceResult, unwrapServiceSuccess } from "@/lib/api/service-result";

import type { UpdateBusinessSettingsInput } from "../schemas/settings.schema";
import { getBusinessSettings, updateBusinessSettings } from "../services/settings.service";

/** Business details: the sidebar name, receipts, and whether transfers/POS need a confirmation. */
export function useBusinessSettings() {
  return useQuery({
    queryKey: queryKeys.settings.business(),
    queryFn: async () => unwrapServiceResult(await getBusinessSettings()),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateBusinessSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateBusinessSettingsInput) =>
      unwrapServiceSuccess(await updateBusinessSettings(input)),
    onSuccess: ({ data }) => {
      client.setQueryData(queryKeys.settings.business(), data);
      void client.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
