import Image from "next/image";
import type { ReactNode } from "react";

import { publicEnv } from "@/config/env";

/**
 * The sign-in screens' split layout: the full Cartory logo on its black ground (the only place the
 * full logo appears in the app), and the form beside it. Stacks on phones.
 */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center border-b border-divider bg-logo px-8 py-10 md:border-r md:border-b-0 md:p-12">
        <Image
          alt={publicEnv.NEXT_PUBLIC_APP_NAME}
          className="h-auto w-full max-w-[260px] md:max-w-[560px]"
          height={1530}
          preload
          sizes="(min-width: 768px) 560px, 260px"
          src="/brand/cartory-logo.png"
          width={2630}
        />
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:py-12">{children}</div>
    </div>
  );
}

/** The kicker and title block at the top of an auth form. */
export function AuthHeading({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] tracking-[0.12em] text-accent uppercase">
        {publicEnv.NEXT_PUBLIC_APP_NAME} · Payment desk
      </p>
      <h1>{title}</h1>
      <p className="text-[14px] text-neutral-700">{description}</p>
    </div>
  );
}
