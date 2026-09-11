// Pure, DOM-free logic for the Week 4 "Ten-Second Window" experiment. A
// component wires this to the page; nothing here touches the DOM or a real
// clock — it only takes the component's measured outcome as a plain argument
// (see spec/autoplay-window.test.ts), the same discipline Week 6 established
// for real-elapsed-time interactions.
//
// Deliberately not Week 1's friction condition (a button temporarily
// disabled while both options still require a click): here, doing nothing at
// all is itself an outcome. Continuing needs no action; only interrupting
// does. The three rounds hold the countdown's real duration constant and
// vary only how reachable the interrupt control is — isolating "removing the
// stopping point" from "the window itself got shorter."

export type Condition = "baseline" | "buried" | "silent";

export interface RoundConfig {
  id: string;
  condition: Condition;
  /** The real countdown length every round runs for. Identical across all three rounds by design. */
  countdownMs: number;
  /** Extra ms the interrupt control stays hidden behind a reveal step. 0 = immediately reachable. */
  controlRevealDelayMs: number;
  /** Whether the round announces, up front, that autoplay is about to happen. */
  announced: boolean;
}

export const ROUNDS: readonly RoundConfig[] = [
  {
    id: "round-1",
    condition: "baseline",
    countdownMs: 6_000,
    controlRevealDelayMs: 0,
    announced: true,
  },
  {
    id: "round-2",
    condition: "buried",
    countdownMs: 6_000,
    controlRevealDelayMs: 2_000,
    announced: true,
  },
  {
    id: "round-3",
    condition: "silent",
    countdownMs: 6_000,
    controlRevealDelayMs: 0,
    announced: false,
  },
] as const;

export type Outcome = "interrupted-early" | "interrupted-late" | "autoplayed";

export interface RoundResponse {
  condition: Condition;
  countdownMs: number;
  /** ms remaining on the countdown at the moment of interruption, or null if autoplay fired first. */
  remainingMsAtInterrupt: number | null;
  outcome: Outcome;
}

export interface ExperimentState {
  roundIndex: number;
  responses: readonly RoundResponse[];
}

export function createInitialState(): ExperimentState {
  return { roundIndex: 0, responses: [] };
}

export function currentRound(state: ExperimentState): RoundConfig | null {
  return ROUNDS[state.roundIndex] ?? null;
}

export function isComplete(state: ExperimentState): boolean {
  return state.roundIndex >= ROUNDS.length;
}

function classify(round: RoundConfig, remainingMsAtInterrupt: number | null): Outcome {
  if (remainingMsAtInterrupt === null) return "autoplayed";
  return remainingMsAtInterrupt >= round.countdownMs / 2 ? "interrupted-early" : "interrupted-late";
}

/** remainingMsAtInterrupt is null when the round's countdown ran out before any interrupt click. */
export function recordOutcome(
  state: ExperimentState,
  remainingMsAtInterrupt: number | null,
): ExperimentState {
  const round = currentRound(state);
  if (!round) return state;

  const clamped =
    remainingMsAtInterrupt === null
      ? null
      : Math.min(Math.max(remainingMsAtInterrupt, 0), round.countdownMs);

  return {
    roundIndex: state.roundIndex + 1,
    responses: [
      ...state.responses,
      {
        condition: round.condition,
        countdownMs: round.countdownMs,
        remainingMsAtInterrupt: clamped,
        outcome: classify(round, clamped),
      },
    ],
  };
}

const CONDITION_NOTES: Record<Condition, string> = {
  baseline: "The interrupt control was visible and enabled the entire time, clearly announced.",
  buried:
    "The countdown ran for the same length of time, but the interrupt control stayed hidden behind an extra step for the first two seconds — the window didn't shrink, reaching the control just cost more of it.",
  silent:
    "The interrupt control was just as reachable as the baseline round, but nothing announced up front that autoplay was about to happen at all.",
};

export interface RoundSummary extends RoundResponse {
  roundNumber: number;
  note: string;
}

export function summarize(state: ExperimentState): RoundSummary[] {
  return state.responses.map((response, index) => ({
    ...response,
    roundNumber: index + 1,
    note: CONDITION_NOTES[response.condition],
  }));
}

export function autoplayedCount(state: ExperimentState): number {
  return state.responses.filter((response) => response.outcome === "autoplayed").length;
}
