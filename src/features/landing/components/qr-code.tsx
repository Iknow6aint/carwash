import { cn } from "@/lib/utils";

import { QR_FINDERS, QR_MODULES_PATH, QR_SIZE } from "../utils/qr-pattern";

import styles from "./landing.module.css";

const QUIET = 2;

/** The menu's QR code (illustrative), optionally with a scanning line sweeping over it. */
export function QrCode({ scanning = false }: { scanning?: boolean }) {
  const box = QR_SIZE + QUIET * 2;
  return (
    <div aria-hidden="true" className="relative aspect-square w-full">
      <svg
        className="block size-full"
        shapeRendering="crispEdges"
        viewBox={`${-QUIET} ${-QUIET} ${box} ${box}`}
      >
        <rect className="fill-text" height={box} width={box} x={-QUIET} y={-QUIET} />
        <g className="fill-black">
          <path d={QR_MODULES_PATH} />
          {QR_FINDERS.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect height={7} width={7} x={x} y={y} />
              <rect className="fill-text" height={5} width={5} x={x + 1} y={y + 1} />
              <rect height={3} width={3} x={x + 2} y={y + 2} />
            </g>
          ))}
        </g>
      </svg>
      {scanning ? <div className={cn(styles.scan)} /> : null}
    </div>
  );
}
