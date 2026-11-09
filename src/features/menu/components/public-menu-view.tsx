import Image from "next/image";

import { Blueprint } from "@/components/ui/blueprint";

import type { PublicMenu } from "../schemas/menu.schema";

import { MenuServices } from "./menu-services";

/** The public menu a customer opens from the QR code: brand, business, services, prices. */
export function PublicMenuView({ menu }: { menu: PublicMenu }) {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-bg px-4 py-8 text-text sm:py-12">
      <div className="flex w-full max-w-[560px] flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <Image
            alt=""
            className="size-9 object-contain"
            height={36}
            src="/brand/cartory-mark.png"
            width={36}
          />
          <span className="font-heading text-[20px] font-semibold">Cartory Wash</span>
        </div>
        <Blueprint className="flex flex-col gap-4 p-5 sm:p-7">
          <div className="flex flex-col gap-1 border-b border-divider pb-4">
            <h1 className="m-0 text-[clamp(30px,8vw,42px)] leading-[1]">{menu.business.name}</h1>
            {menu.business.address ? (
              <p className="text-[13px] text-neutral-700">{menu.business.address}</p>
            ) : null}
          </div>
          <MenuServices services={menu.services} showPrices={menu.showPrices} />
        </Blueprint>
        <p className="text-center text-[12px] text-neutral-600">
          Services and prices from {menu.business.name}.
        </p>
      </div>
    </main>
  );
}
