"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * Moves the cursor spotlight on whichever `[data-spotlight]` card is under the pointer (one
 * listener for the grid; the cards stay server-rendered).
 */
export function SpotlightGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const card =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-spotlight]")
        : null;
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - box.left}px`);
    card.style.setProperty("--my", `${event.clientY - box.top}px`);
  };

  return (
    <div className={className} onMouseMove={onMouseMove}>
      {children}
    </div>
  );
}
