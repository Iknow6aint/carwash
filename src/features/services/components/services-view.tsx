"use client";

import { useState } from "react";

import { Can } from "@/components/access/can";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Notice } from "@/components/feedback/notice";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableHeader,
  TableSkeleton,
} from "@/components/ui/table";
import { useCan } from "@/providers/session-provider";

import { useServices } from "../hooks/use-services";

import { AddServiceForm } from "./add-service-form";
import { ServiceRow } from "./service-row";

/**
 * Services & prices. Admins add, edit, deactivate and activate; cashiers read the list and are
 * reminded they can still adjust one sale's price with a reason.
 */
export function ServicesView() {
  const services = useServices();
  const canManage = useCan("services:manage");
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex max-w-[880px] flex-col gap-5">
      <Can
        action="services:manage"
        fallback={
          <Notice>
            Prices are set by an admin. You can still adjust a price on a single transaction and
            give a reason.
          </Notice>
        }
      >
        <AddServiceForm />
      </Can>

      {services.isPending ? (
        <TableSkeleton columns={canManage ? 5 : 4} label="Loading services" />
      ) : services.isError ? (
        <ErrorState
          error={services.error}
          onRetry={() => void services.refetch()}
          title="Services didn't load."
        />
      ) : services.data.length === 0 ? (
        <EmptyState
          description={
            canManage ? "Add the first one above; it shows on New transaction at once." : undefined
          }
          title="No services yet."
        />
      ) : (
        <TableContainer label="Services and prices">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Service</TableHead>
                <TableHead numeric>Price</TableHead>
                <TableHead numeric>Sold · 30 days</TableHead>
                <TableHead>Status</TableHead>
                {canManage ? (
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                ) : null}
              </tr>
            </TableHeader>
            <TableBody>
              {services.data.map((service) => (
                <ServiceRow
                  canManage={canManage}
                  editing={editingId === service.id}
                  key={service.id}
                  onDoneEditing={() => setEditingId(null)}
                  onEdit={() => setEditingId(service.id)}
                  service={service}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <p className="text-[13px] text-neutral-700">
        Price changes apply to new transactions only. Past receipts keep the price that was charged.
      </p>
    </div>
  );
}
