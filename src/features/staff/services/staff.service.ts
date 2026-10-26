"use server";

import { userSchema, type User } from "@/features/auth/schemas/auth.schema";
import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES } from "@/lib/api/endpoints";
import { idSchema } from "@/lib/api/schema-helpers";
import { executeBackendService } from "@/lib/api/server-service";
import type { ServiceResult } from "@/lib/api/service-result";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";

import {
  addStaffSchema,
  resetPasswordSchema,
  staffListSchema,
  updateStaffSchema,
  type AddStaffInput,
  type StaffMember,
  type UpdateStaffInput,
} from "../schemas/staff.schema";

/**
 * Staff accounts (staff.md, admin only). Staff are deactivated, never deleted; deactivation, role
 * changes and password resets end that person's sessions at once.
 */

const parseUser = (data: unknown) => userSchema.parse(data);

/** Everyone, active first, with today's paid count. */
export async function listStaff(): Promise<ServiceResult<StaffMember[]>> {
  return executeBackendService(async () =>
    mapBackendData(authenticatedBackendRequest(API_ROUTES.staff.list), (data) =>
      staffListSchema.parse(data),
    ),
  );
}

/** Adds someone with a temporary password; they choose their own at first sign-in. */
export async function addStaff(input: AddStaffInput): Promise<ServiceResult<User>> {
  return executeBackendService(async () => {
    const body = addStaffSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.staff.list, { method: "POST", body }),
      parseUser,
    );
  });
}

/** Renames or changes role. `LAST_ADMIN` when demoting the last active admin. */
export async function updateStaff(
  id: string,
  input: UpdateStaffInput,
): Promise<ServiceResult<User>> {
  return executeBackendService(async () => {
    const body = updateStaffSchema.parse(input);
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.staff.detail(idSchema.parse(id)), {
        method: "PATCH",
        body,
      }),
      parseUser,
    );
  });
}

/** Deactivates (signs them out everywhere). `CANNOT_DEACTIVATE_SELF`, `LAST_ADMIN`. */
export async function deactivateStaff(id: string): Promise<ServiceResult<User>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(API_ROUTES.staff.deactivate(idSchema.parse(id)), {
        method: "POST",
      }),
      parseUser,
    ),
  );
}

export async function reactivateStaff(id: string): Promise<ServiceResult<User>> {
  return executeBackendService(async () =>
    mapBackendData(
      authenticatedBackendRequest(API_ROUTES.staff.reactivate(idSchema.parse(id)), {
        method: "POST",
      }),
      parseUser,
    ),
  );
}

/** Sets a new temporary password; they must change it at their next sign-in. */
export async function resetStaffPassword(
  id: string,
  temporaryPassword: string,
): Promise<ServiceResult<User>> {
  return executeBackendService(async () => {
    const body = resetPasswordSchema.parse({ temporaryPassword });
    return mapBackendData(
      authenticatedBackendRequest(API_ROUTES.staff.resetPassword(idSchema.parse(id)), {
        method: "POST",
        body,
      }),
      parseUser,
    );
  });
}
