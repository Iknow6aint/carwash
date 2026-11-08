import type { BusinessStatus } from "@/lib/api/schema-helpers";

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
};

/**
 * What a super admin can do to a business (platform.md). `decline` is a suspension of a pending
 * registration: same route, different words.
 */
export type BusinessAction = "approve" | "decline" | "suspend" | "reactivate";

const ACTIONS: Record<BusinessStatus, readonly BusinessAction[]> = {
  pending: ["approve", "decline"],
  active: ["suspend"],
  suspended: ["reactivate"],
};

/** The actions the API allows from `status`, in the order the buttons appear. */
export function businessActions(status: BusinessStatus): readonly BusinessAction[] {
  return ACTIONS[status];
}
