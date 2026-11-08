/** "01  WHY CARTORY WASH": the numbered label above each section headline. */
export function SectionKicker({ number, label }: { number: string; label: string }) {
  return (
    <p
      className="flex items-baseline gap-3 text-[12px] tracking-[0.14em] uppercase"
      data-reveal="0"
    >
      <span className="font-semibold text-accent">{number}</span>
      <span className="text-neutral-700">{label}</span>
    </p>
  );
}
