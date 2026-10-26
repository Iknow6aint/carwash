"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { unwrapServiceResult, unwrapServiceSuccess } from "@/lib/api/service-result";

import type { CreateServiceInput, UpdateServiceInput } from "../schemas/service.schema";
import { createService, listServices, updateService } from "../services/services.service";

/** Services; `{ active: true }` for the New transaction tiles. */
export function useServices(filters: { active?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.services.list(filters),
    queryFn: async () => unwrapServiceResult(await listServices(filters)),
  });
}

export function useCreateService() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateServiceInput) =>
      unwrapServiceSuccess(await createService(input)),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.services.all }),
  });
}

export function useUpdateService() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string; input: UpdateServiceInput }) =>
      unwrapServiceSuccess(await updateService(variables.id, variables.input)),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.services.all }),
  });
}
