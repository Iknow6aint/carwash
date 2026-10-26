import { redirect } from "next/navigation";

import { landingPath } from "@/lib/auth/return-to";
import { requireUser } from "@/lib/auth/session";

/** `/`: admins land on the dashboard, cashiers on New transaction (signed out: sign in). */
export default async function HomePage() {
  redirect(landingPath(await requireUser()));
}
