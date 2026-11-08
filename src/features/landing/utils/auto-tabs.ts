/**
 * Auto-advancing tabs ("How it works", "Product tour"). They start when the section scrolls into
 * view, move on every few seconds, and stop for good once the visitor picks one. After each change
 * the panel "enters" 60 ms later so its staggered transitions run.
 */

export interface AutoTabsState {
  active: number;
  /** The active panel has entered (its end state shows). */
  entered: boolean;
  /** Still advancing by itself. */
  auto: boolean;
  /** Seen, or picked: timers may run. */
  started: boolean;
}

export type AutoTabsAction =
  | { type: "start" }
  | { type: "advance"; count: number }
  | { type: "pick"; index: number }
  | { type: "enter" };

export const ENTER_DELAY_MS = 60;

export const initialAutoTabsState: AutoTabsState = {
  active: 0,
  entered: false,
  auto: true,
  started: false,
};

export function autoTabsReducer(state: AutoTabsState, action: AutoTabsAction): AutoTabsState {
  switch (action.type) {
    case "start":
      return state.started ? state : { active: 0, entered: false, auto: true, started: true };
    case "advance":
      return state.auto
        ? { ...state, active: (state.active + 1) % action.count, entered: false }
        : state;
    case "pick":
      return { active: action.index, entered: false, auto: false, started: true };
    case "enter":
      return state.entered ? state : { ...state, entered: true };
  }
}

/** "01 / 04". */
export function tabCounter(active: number, count: number): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(active + 1)} / ${pad(count)}`;
}
