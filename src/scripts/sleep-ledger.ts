// Pure, DOM-free logic for the Week 10 "The Sleep Ledger" experiment. A
// component wires this to the page; nothing here touches the DOM (see
// spec/sleep-ledger.test.ts).
//
// Deliberately not another hidden-total accumulation task like Week 7: here
// the running total is the whole point, and it's visible the entire time as
// a depleting budget. Every episode costs the exact same fixed amount of
// sleep time — deliberately held constant across the whole session — so the
// only variable in play is how many times the visitor chooses to spend it,
// not whether any single episode "costs more" than another.

export const STARTING_BUDGET_MINUTES = 480; // 8 hours, before a fixed wake-up time
export const EPISODE_COST_MINUTES = 42; // one fixed episode length, identical every time

export interface LedgerState {
  episodesWatched: number;
  remainingMinutes: number;
  stopped: boolean;
}

export function createInitialState(): LedgerState {
  return { episodesWatched: 0, remainingMinutes: STARTING_BUDGET_MINUTES, stopped: false };
}

export function canAffordAnother(state: LedgerState): boolean {
  return !state.stopped && state.remainingMinutes >= EPISODE_COST_MINUTES;
}

export function isComplete(state: LedgerState): boolean {
  return state.stopped || !canAffordAnother(state);
}

/** Spends one fixed episode's worth of sleep time. A no-op if the budget can't cover it, or the session is already over. */
export function watchOne(state: LedgerState): LedgerState {
  if (!canAffordAnother(state)) return state;
  return {
    ...state,
    episodesWatched: state.episodesWatched + 1,
    remainingMinutes: state.remainingMinutes - EPISODE_COST_MINUTES,
  };
}

/** Ends the session by choice, banking whatever sleep time is left. A no-op once already complete. */
export function stopForSleep(state: LedgerState): LedgerState {
  if (isComplete(state)) return state;
  return { ...state, stopped: true };
}

export type RestLevel = "full-night" | "slightly-short" | "notably-short" | "very-short";

const REST_LEVEL_LABEL: Record<RestLevel, string> = {
  "full-night": "a full night",
  "slightly-short": "slightly short of a full night",
  "notably-short": "notably short",
  "very-short": "very short",
};

/** Fixed illustrative thresholds against the 8-hour starting budget, not a real sleep-medicine guideline. */
export function classifyRest(remainingMinutes: number): RestLevel {
  if (remainingMinutes >= 420) return "full-night"; // 7h+
  if (remainingMinutes >= 360) return "slightly-short"; // 6-7h
  if (remainingMinutes >= 240) return "notably-short"; // 4-6h
  return "very-short";
}

export interface LedgerSummary {
  episodesWatched: number;
  remainingMinutes: number;
  restLevel: RestLevel;
  restLevelLabel: string;
}

export function summarize(state: LedgerState): LedgerSummary {
  const restLevel = classifyRest(state.remainingMinutes);
  return {
    episodesWatched: state.episodesWatched,
    remainingMinutes: state.remainingMinutes,
    restLevel,
    restLevelLabel: REST_LEVEL_LABEL[restLevel],
  };
}
