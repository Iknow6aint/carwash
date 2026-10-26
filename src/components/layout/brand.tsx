import Image from "next/image";

import { Corners } from "@/components/ui/blueprint";
import { cn } from "@/lib/utils";

/**
 * The Cartory T mark on its black tile (the artwork has a black ground). Sidebar 48 px with
 * registration marks, receipt 56 px.
 */
export function BrandMark({
  size = 48,
  marks = true,
  alt = "",
  className,
}: {
  size?: 32 | 48 | 56;
  marks?: boolean;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex-none bg-logo", marks && "blueprint border border-divider", className)}
      data-print-logo=""
      style={{ width: size, height: size }}
    >
      {marks ? <Corners /> : null}
      <Image
        alt={alt}
        className="size-full object-contain p-1"
        height={size * 2}
        src="/brand/cartory-mark.png"
        width={size * 2}
      />
    </div>
  );
}

/** Sidebar brand: mark, business name and the "Payment desk" kicker. */
export function Brand({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 px-1.5">
      <BrandMark alt="" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="font-heading text-[22px] leading-[1.05] font-semibold tracking-[-0.01em] break-words">
          {name}
        </div>
        <div className="text-[10px] tracking-[0.12em] text-accent-700 uppercase">Payment desk</div>
      </div>
    </div>
  );
}
