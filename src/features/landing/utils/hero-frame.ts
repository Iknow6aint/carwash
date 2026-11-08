import { formatNaira, nairaToKobo } from "@/lib/format/money";

/**
 * The hero's animated New transaction desk. A 17-step loop, one step every 550 ms: tap Full wash,
 * search "eng" and tap Engine wash, type the plate, pick bank transfer and confirm it, press Save,
 * show the receipt, the "₦11,000 paid" chip and the owner's phone notification, then start again.
 *
 * - `heroFrame(step)` is what every part of the mock shows at a step.
 * - `heroClockAt(ms)` is the step and the owner's live revenue figure `ms` into the loop.
 */

export const HERO_STEP_MS = 550;
export const HERO_STEP_COUNT = 17;
const CYCLE_MS = HERO_STEP_MS * HERO_STEP_COUNT;

/** The step on which the sale is saved: the receipt appears and revenue eases up over 900 ms. */
const SAVE_STEP = 8;
const REVENUE_TWEEN_MS = 900;
const TWEEN_TICK_MS = 40;

const REVENUE_BEFORE = 178_500;
const REVENUE_AFTER = 189_500;
const TRANSFER_BEFORE = 146_500;
/** POS takings on the owner's phone (they don't change in the loop). */
export const HERO_POS_REVENUE = 32_000;

/** Where the loop is: the step and the owner's revenue (whole naira) and cars washed. */
export interface HeroClock {
  step: number;
  revenue: number;
  cars: number;
}

/** Before the first tap (also what the server renders). */
export const HERO_START: HeroClock = { step: 0, revenue: REVENUE_BEFORE, cars: 29 };
/** The finished sale, shown still when motion is reduced. */
export const HERO_END: HeroClock = { step: 10, revenue: REVENUE_AFTER, cars: 30 };

const TILES = [
  ["Exterior wash", 3_000],
  ["Interior", 4_000],
  ["Full wash", 6_000],
  ["Engine wash", 5_000],
  ["Premium detail", 12_000],
  ["Upholstery", 15_000],
] as const;
const FULL_WASH = 2;
const ENGINE_WASH = 3;

const METHODS = ["Transfer", "POS"] as const;
const TRANSFER = 0;

export interface HeroTile {
  name: string;
  price: string;
  selected: boolean;
  /** Being tapped this step (pressed in, with a ring). */
  tapped: boolean;
  /** Faded while the search narrows the list. */
  dimmed: boolean;
}

export interface HeroMethod {
  label: string;
  selected: boolean;
  tapped: boolean;
}

export interface HeroFrame {
  /** The "A sale in three steps" stage: -1 idle, 0 services, 1 method, 2 save. */
  stage: -1 | 0 | 1 | 2;
  tiles: HeroTile[];
  methods: HeroMethod[];
  /** "", "1 selected" or "2 selected". */
  selectedCount: string;
  /** The search box shows "eng" (focused) instead of its placeholder. */
  searching: boolean;
  plate: string;
  /** The plate field is focused, with a caret. */
  typingPlate: boolean;
  summaryServices: string;
  summaryMethod: string;
  confirmShown: boolean;
  confirmTicked: boolean;
  total: string;
  savePressed: boolean;
  receiptShown: boolean;
  chipShown: boolean;
  notificationShown: boolean;
}

/** What the desk mock shows at `step` (0–16). */
export function heroFrame(step: number): HeroFrame {
  const s = step;
  const live = s >= 1 && s <= 15;
  const methodChosen = live && s >= 5;

  const tiles = TILES.map(([name, price], index): HeroTile => {
    const selected = (index === FULL_WASH && live) || (index === ENGINE_WASH && live && s >= 2);
    return {
      name,
      price: formatNaira(nairaToKobo(price)),
      selected,
      tapped: (index === FULL_WASH && s === 1) || (index === ENGINE_WASH && s === 2),
      dimmed: s === 2 && index !== FULL_WASH && index !== ENGINE_WASH,
    };
  });

  const methods = METHODS.map((label, index): HeroMethod => ({
    label,
    selected: index === TRANSFER && methodChosen,
    tapped: index === TRANSFER && s === 5,
  }));

  return {
    stage: !live ? -1 : s < 5 ? 0 : s < 7 ? 1 : 2,
    tiles,
    methods,
    selectedCount: !live ? "" : s >= 2 ? "2 selected" : "1 selected",
    searching: s === 2,
    plate: !live || s < 3 ? "" : s === 3 ? "KJA 4" : "KJA 482 FX",
    typingPlate: s === 3 || s === 4,
    summaryServices: !live ? "—" : s >= 2 ? "2 services" : "Full wash",
    summaryMethod: methodChosen ? "Bank transfer" : "—",
    confirmShown: methodChosen,
    confirmTicked: live && s >= 6,
    total: !live ? "₦0" : s >= 2 ? "₦11,000" : "₦6,000",
    savePressed: s === 7,
    receiptShown: s >= 8 && s <= 14,
    chipShown: s >= 9 && s <= 14,
    notificationShown: s >= 8 && s <= 13,
  };
}

function cyclePosition(elapsedMs: number): number {
  return ((elapsedMs % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
}

/** The loop `elapsedMs` after it started at step 0 (it repeats every 17 steps). */
export function heroClockAt(elapsedMs: number): HeroClock {
  const t = cyclePosition(elapsedMs);
  const step = Math.floor(t / HERO_STEP_MS);
  const sinceSave = t - SAVE_STEP * HERO_STEP_MS;
  if (sinceSave < 0) return { step, revenue: REVENUE_BEFORE, cars: HERO_START.cars };
  const progress = Math.min(1, sinceSave / REVENUE_TWEEN_MS);
  const eased = 1 - (1 - progress) ** 3;
  return {
    step,
    revenue: Math.round(REVENUE_BEFORE + (REVENUE_AFTER - REVENUE_BEFORE) * eased),
    cars: progress > 0.3 ? HERO_END.cars : HERO_START.cars,
  };
}

/** Milliseconds until the clock next changes: every 40 ms while revenue eases up, else next step. */
export function heroNextTickIn(elapsedMs: number): number {
  const t = cyclePosition(elapsedMs);
  const sinceSave = t - SAVE_STEP * HERO_STEP_MS;
  if (sinceSave >= 0 && sinceSave < REVENUE_TWEEN_MS) return TWEEN_TICK_MS;
  return HERO_STEP_MS - (t % HERO_STEP_MS);
}

/** The owner's phone: transfer grows with each sale, POS stays put; shares are of the total. */
export function heroRevenueSplit(revenue: number) {
  const transfer = TRANSFER_BEFORE + (revenue - REVENUE_BEFORE);
  return {
    transfer,
    pos: HERO_POS_REVENUE,
    transferShare: transfer / revenue,
    posShare: HERO_POS_REVENUE / revenue,
  };
}
