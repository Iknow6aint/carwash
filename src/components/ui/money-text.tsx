import { formatNaira, formatSignedNaira } from "@/lib/format/money";
import { cn } from "@/lib/utils";

interface MoneyTextProps {
  /** Integer kobo; `null` shows an em dash. */
  kobo: number | null | undefined;
  /** "+₦500" / "−₦500" for differences. */
  signed?: boolean;
  /** Struck through: cancelled transactions keep their amount on screen but not in totals. */
  struck?: boolean;
  className?: string;
}

/** A naira amount ("₦12,500") with tabular figures so columns of money line up. */
export function MoneyText({ kobo, signed = false, struck = false, className }: MoneyTextProps) {
  const text =
    signed && kobo !== null && kobo !== undefined ? formatSignedNaira(kobo) : formatNaira(kobo);
  return <span className={cn("tabular-nums", struck && "line-through", className)}>{text}</span>;
}
