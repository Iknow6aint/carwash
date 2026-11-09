import { z } from "zod";

import { idSchema } from "@/lib/api/schema-helpers";

/** menu.md — `PublicMenu`: what a customer's phone shows for one business. */
export const publicMenuSchema = z.object({
  business: z.object({
    id: idSchema,
    name: z.string().min(1),
    address: z.string(),
  }),
  /** When false the menu lists services without prices. */
  showPrices: z.boolean(),
  services: z.array(
    z.object({
      id: idSchema,
      name: z.string().min(1),
      /** Missing when the business hides prices. */
      priceKobo: z.number().int().positive().optional(),
    }),
  ),
});
export type PublicMenu = z.output<typeof publicMenuSchema>;
export type MenuService = PublicMenu["services"][number];
