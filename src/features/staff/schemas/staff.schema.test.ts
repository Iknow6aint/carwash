import { describe, expect, it } from "vitest";

import { staffMember } from "@/testing/fixtures";

import { addStaffSchema, staffListSchema } from "./staff.schema";

describe("staffListSchema", () => {
  it("parses StaffMember (User + todayCount)", () => {
    expect(staffListSchema.parse([staffMember])[0]?.todayCount).toBe(14);
  });

  it("rejects a staff member without todayCount", () => {
    expect(staffListSchema.safeParse([{ ...staffMember, todayCount: undefined }]).success).toBe(
      false,
    );
  });

  it("validates new staff with a temporary password", () => {
    const valid = {
      name: "Grace Eze",
      email: "Grace@CartoryWash.ng",
      role: "cashier",
      temporaryPassword: "temp-1234",
    };
    expect(addStaffSchema.parse(valid).email).toBe("grace@cartorywash.ng");
    expect(addStaffSchema.safeParse({ ...valid, temporaryPassword: "short" }).success).toBe(false);
    expect(addStaffSchema.safeParse({ ...valid, role: "owner" }).success).toBe(false);
  });
});
