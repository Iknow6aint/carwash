import { cn } from "@/lib/utils";

import styles from "../landing.module.css";

import { IntroArt } from "./intro-art";

/** The full-screen intro. A click anywhere (or "Skip intro") lifts it. */
export function IntroOverlay({ lifting, onSkip }: { lifting: boolean; onSkip: () => void }) {
  return (
    <div
      className={cn(
        styles.intro,
        "fixed inset-0 z-100 flex cursor-pointer items-center justify-center bg-bg",
      )}
      data-lifting={lifting ? "" : undefined}
      onClick={onSkip}
    >
      <IntroArt />
      <button
        className="absolute right-6 bottom-6 border border-divider px-3.5 py-2 text-[12px] font-medium tracking-[0.1em] text-neutral-700 uppercase transition-colors duration-200 hover:border-accent hover:text-accent"
        onClick={(event) => {
          event.stopPropagation();
          onSkip();
        }}
        type="button"
      >
        Skip intro
      </button>
    </div>
  );
}
