import { cn } from "@/lib/utils";

import { cssVars } from "../../utils/css-vars";
import { BUBBLES, DROPS, SPOKES, WHEEL } from "../../utils/intro-geometry";
import styles from "../landing.module.css";

const { cx, cy, r } = WHEEL;
const HOSE_PATH = "M -40 420 C 40 418, 70 300, 150 254";

const WORDS = [
  { label: "Rinse", className: "text-(--accent-2)", delay: "1s" },
  { label: "Soap", className: "text-text", delay: "1.7s" },
  { label: "Shine", className: "text-accent", delay: "2.4s" },
] as const;

/** The intro illustration: the wheel rolls in and spins, the hose sprays, bubbles rise. */
export function IntroArt() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex w-[min(860px,94vw)] flex-col items-center gap-5"
    >
      <svg className="block w-full overflow-visible" viewBox="0 0 800 420">
        <line className="stroke-divider" strokeWidth={1} x1={40} x2={760} y1={381} y2={381} />
        <g className={styles.introRoll}>
          <ellipse className="fill-black/60" cx={cx} cy={384} rx={120} ry={8} />
          <g className={styles.introSpin}>
            <circle
              className="fill-neutral-100 stroke-neutral-400"
              cx={cx}
              cy={cy}
              r={r}
              strokeWidth={2}
            />
            <circle
              className="fill-none stroke-neutral-300"
              cx={cx}
              cy={cy}
              r={r - 7}
              strokeDasharray="11 7"
              strokeWidth={12}
            />
            <circle className="fill-none stroke-neutral-400" cx={cx} cy={cy} r={98} />
            <circle className="fill-bg stroke-text" cx={cx} cy={cy} r={84} strokeWidth={1.5} />
            <circle className="fill-none stroke-divider" cx={cx} cy={cy} r={78} />
            {SPOKES.map((spoke) => (
              <g key={`${spoke.x2}-${spoke.y2}`}>
                <line
                  className="stroke-accent"
                  strokeLinecap="square"
                  strokeWidth={7}
                  x1={spoke.x1}
                  x2={spoke.x2}
                  y1={spoke.y1}
                  y2={spoke.y2}
                />
                <circle className="fill-bg" cx={spoke.nutX} cy={spoke.nutY} r={2.6} />
              </g>
            ))}
            <circle className="fill-accent" cx={cx} cy={cy} r={22} />
            <circle className="fill-bg" cx={cx} cy={cy} r={6} />
          </g>
          <circle
            className={cn(styles.introGlint, "fill-none stroke-text")}
            cx={cx}
            cy={cy}
            r={r - 2}
            strokeDasharray="70 900"
            strokeLinecap="round"
            strokeWidth={3}
            style={cssVars({ "--d": "2.45s" })}
            transform={`rotate(-80 ${cx} ${cy})`}
          />
          <circle
            className={cn(styles.introGlint, "fill-none stroke-accent")}
            cx={cx}
            cy={cy}
            r={r - 2}
            strokeDasharray="40 900"
            strokeLinecap="round"
            strokeWidth={2}
            style={cssVars({ "--d": "2.6s" })}
            transform={`rotate(10 ${cx} ${cy})`}
          />
        </g>
        <polygon
          className={cn(styles.introMist, "fill-(--accent-2)")}
          points="238,246 352,196 352,312 238,258"
        />
        {DROPS.map((drop, index) => (
          <circle
            className={cn(styles.introDrop, drop.white ? "fill-text" : "fill-(--accent-2)")}
            cx={238}
            cy={252}
            key={index}
            r={drop.r}
            style={cssVars({
              "--dx": `${drop.dx}px`,
              "--dy": `${drop.dy}px`,
              "--d": `${drop.delay}s`,
            })}
          />
        ))}
        {BUBBLES.map((bubble, index) => (
          <circle
            className={cn(styles.introBubble, "fill-text/10 stroke-text")}
            cx={bubble.x}
            cy={bubble.y}
            key={index}
            r={bubble.r}
            strokeWidth={1}
            style={cssVars({ "--d": `${bubble.delay}s` })}
          />
        ))}
        <g className={styles.introHose}>
          <path
            className="fill-none stroke-(--orange)"
            d={HOSE_PATH}
            strokeLinecap="round"
            strokeWidth={11}
          />
          <path
            className="fill-none stroke-black/35"
            d={HOSE_PATH}
            strokeDasharray="3 9"
            strokeWidth={2}
          />
          <rect
            className="fill-neutral-300 stroke-text"
            height={24}
            strokeWidth={1.2}
            width={66}
            x={146}
            y={240}
          />
          <path
            className="fill-neutral-300 stroke-text"
            d="M 160 264 L 152 296 L 166 296 L 176 264"
            strokeWidth={1.2}
          />
          <rect className="fill-accent" height={14} width={26} x={212} y={245} />
        </g>
      </svg>
      <div className="flex gap-[clamp(18px,4vw,40px)] font-heading text-[clamp(20px,3vw,30px)] font-semibold tracking-[0.16em] uppercase">
        {WORDS.map((word) => (
          <span
            className={cn(styles.introWord, word.className)}
            key={word.label}
            style={cssVars({ "--d": word.delay })}
          >
            {word.label}
          </span>
        ))}
      </div>
      <div className="h-0.5 w-60 overflow-hidden bg-neutral-300">
        <div className={cn(styles.introBar, "h-full bg-accent")} />
      </div>
      <div
        className={cn(
          styles.introName,
          "font-heading text-[18px] font-semibold tracking-[0.02em] text-text",
        )}
      >
        Cartory Wash
      </div>
    </div>
  );
}
