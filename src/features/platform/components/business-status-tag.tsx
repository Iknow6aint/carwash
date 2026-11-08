import { Tag, type TagTone } from "@/components/ui/tag";
import type { BusinessStatus } from "@/lib/api/schema-helpers";

import { BUSINESS_STATUS_LABELS } from "../utils/business-status";

/** Active wears the accent tag, Pending the outline, Suspended the neutral one. No extra colours. */
const TONES: Record<BusinessStatus, TagTone> = {
  active: "accent",
  pending: "outline",
  suspended: "neutral",
};

export function BusinessStatusTag({ status }: { status: BusinessStatus }) {
  return <Tag tone={TONES[status]}>{BUSINESS_STATUS_LABELS[status]}</Tag>;
}
