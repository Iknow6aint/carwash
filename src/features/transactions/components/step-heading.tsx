import type { ReactNode } from "react";

/** "01 Service": the step number in condensed accent, then the section heading. */
export function StepHeading({
  step,
  id,
  children,
  note,
}: {
  step: string;
  id: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span aria-hidden="true" className="font-heading text-[14px] font-semibold text-accent-700">
        {step}
      </span>
      <h3 id={id}>{children}</h3>
      {note ? <span className="text-[13px] text-neutral-700">{note}</span> : null}
    </div>
  );
}
