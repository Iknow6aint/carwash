import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <p className="kicker">404</p>
        <h1>Page not found</h1>
        <p className="text-[14px] text-neutral-700">This page doesn&apos;t exist or has moved.</p>
        <Link className={buttonVariants({ variant: "secondary", className: "mt-3" })} href="/">
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
