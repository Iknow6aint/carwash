"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import {
  unwrapServiceResult,
  unwrapServiceSuccess,
  type ServiceResult,
} from "@/lib/api/service-result";

import type { AddStaffInput, UpdateStaffInput } from "../schemas/staff.schema";
import {
  addStaff,
  deactivateStaff,
  listStaff,
  reactivateStaff,
  resetStaffPassword,
  updateStaff,
} from "../services/staff.service";

/** The staff list. Admin only: pass `enabled: false` for cashiers (the API answers 403). */
export function useStaff({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: queryKeys.staff.list(),
    queryFn: async () => unwrapServiceResult(await listStaff()),
    enabled,
  });
}

/** A staff write that refreshes the list on success and keeps the API's message for a toast. */
function useStaffMutation<TVariables, TData>(
  call: (variables: TVariables) => Promise<ServiceResult<TData>>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: TVariables) => unwrapServiceSuccess(await call(variables)),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.staff.all }),
  });
}

export function useAddStaff() {
  return useStaffMutation((input: AddStaffInput) => addStaff(input));
}

export function useUpdateStaff() {
  return useStaffMutation((variables: { id: string; input: UpdateStaffInput }) =>
    updateStaff(variables.id, variables.input),
  );
}

export function useSetStaffActive() {
  return useStaffMutation((variables: { id: string; active: boolean }) =>
    variables.active ? reactivateStaff(variables.id) : deactivateStaff(variables.id),
  );
}

export function useResetStaffPassword() {
  return useStaffMutation((variables: { id: string; temporaryPassword: string }) =>
    resetStaffPassword(variables.id, variables.temporaryPassword),
  );
}
