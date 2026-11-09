"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format/money";

import type { MenuService } from "../schemas/menu.schema";

/** The customer-facing list, with a quick search. Prices hide when the business turned them off. */
export function MenuServices({
  services,
  showPrices,
}: {
  services: readonly MenuService[];
  showPrices: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return services;
    return services.filter((service) => service.name.toLowerCase().includes(needle));
  }, [query, services]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        aria-label="Search services"
        className="min-h-11 text-[16px]"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search services"
        type="search"
        value={query}
      />
      <div className="flex flex-col">
        {filtered.map((service) => (
          <div
            className="flex items-baseline justify-between gap-4 border-b border-divider py-3"
            key={service.id}
          >
            <span className="text-[15px]">{service.name}</span>
            {showPrices && service.priceKobo !== undefined ? (
              <span className="font-heading text-[18px] font-semibold tabular-nums">
                {formatNaira(service.priceKobo)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-neutral-700">
          {services.length === 0 ? "No services on the menu yet." : "No service matches that."}
        </p>
      ) : null}
    </div>
  );
}
