"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Notice } from "@/components/feedback/notice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/ui/table";
import { Tag } from "@/components/ui/tag";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth/access";
import { useCan, useSession } from "@/providers/session-provider";

import { useStaff } from "../hooks/use-staff";

import { AddStaffForm } from "./add-staff-form";
import { StaffRowActions } from "./staff-row-actions";

/**
 * Settings & staff, right column. Admins see every account with today's count and manage them;
 * `GET /staff` is admin-only, so cashiers get a short notice instead of the table.
 */
export function StaffPanel() {
  const canManage = useCan("staff:manage");
  const { user } = useSession();
  const staff = useStaff({ enabled: canManage });

  return (
    <section className="flex min-w-0 flex-[1.4_1_420px] flex-col gap-3.5">
      <h3>Staff accounts</h3>
      {!canManage ? (
        <Notice>
          Staff accounts are managed by an admin. Ask one to add someone or reset a password.
        </Notice>
      ) : staff.isPending ? (
        <TableSkeleton columns={6} label="Loading staff" rows={3} />
      ) : staff.isError ? (
        <ErrorState
          error={staff.error}
          onRetry={() => void staff.refetch()}
          title="Staff didn't load."
        />
      ) : staff.data.length === 0 ? (
        <EmptyState title="No staff accounts yet." />
      ) : (
        <TableContainer label="Staff accounts">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead numeric>Today</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {staff.data.map((member) => (
                <TableRow
                  className={member.isActive ? undefined : "text-neutral-700"}
                  key={member.id}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {member.name}
                    {member.id === user.id ? (
                      <span className="ml-1.5 text-[12px] text-neutral-700">You</span>
                    ) : null}
                    {member.mustChangePassword ? (
                      <span className="block text-[12px] font-normal text-neutral-700">
                        Temporary password
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-neutral-700">{member.email}</TableCell>
                  <TableCell>
                    <Tag tone={member.role === "admin" ? "accent" : "neutral"}>
                      {ROLE_LABELS[member.role]}
                    </Tag>
                  </TableCell>
                  <TableCell numeric>{member.todayCount}</TableCell>
                  <TableCell>
                    {member.isActive ? (
                      <Tag tone="accent">Active</Tag>
                    ) : (
                      <Tag tone="neutral">Deactivated</Tag>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <StaffRowActions isSelf={member.id === user.id} member={member} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {canManage ? <AddStaffForm /> : null}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 text-[13px] leading-normal">
        {(["cashier", "admin"] as const).map((role) => (
          <div key={role}>
            <p className="mb-0.5 font-medium">{ROLE_LABELS[role]}</p>
            <p className="text-neutral-700">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
