// Pure, DOM-free logic for the Week 1 "Three Interfaces" experiment. A
// component wires this to the page; nothing here touches the DOM, so it's
// unit-testable on its own (see spec/one-more-episode.test.ts).

export type Mechanism = "baseline" | "friction" | "anticipation";
export type Choice = "continue" | "stop";

export interface RoundConfig {
  id: string;
  mechanism: Mechanism;
  /** The fictional episode-ending line shown before the choice. */
  flavourText: string;
  /** How long the "stop" option is disabled for, in seconds. 0 = no delay. */
  stopDelaySeconds: number;
  /** A curiosity-gap teaser shown next to "continue", or null when absent. */
  teaserText: string | null;
}

export const ROUNDS: readonly RoundConfig[] = [
  {
    id: "round-1",
    mechanism: "baseline",
    flavourText: "The message doesn't say who sent it. The screen cuts to black.",
    stopDelaySeconds: 0,
    teaserText: null,
  },
  {
    id: "round-2",
    mechanism: "friction",
    flavourText: "She picks up the phone. The number isn't in her contacts.",
    stopDelaySeconds: 3,
    teaserText: null,
  },
  {
    id: "round-3",
    mechanism: "anticipation",
    flavourText: "He turns around. Someone is already standing there.",
    stopDelaySeconds: 0,
    teaserText: "Next: the person he trusted most turns out to be the one who called.",
  },
] as const;

export interface RoundResponse {
  mechanism: Mechanism;
  choice: Choice;
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

export function recordChoice(state: ExperimentState, choice: Choice): ExperimentState {
  const round = currentRound(state);
  if (!round) return state;
  return {
    roundIndex: state.roundIndex + 1,
    responses: [...state.responses, { mechanism: round.mechanism, choice }],
  };
}

const MECHANISM_NOTES: Record<Mechanism, string> = {
  baseline: "Nothing was manipulated. Both options were equally easy to take.",
  friction:
    'Stopping was made slower than continuing — a three-second delay before "stop" could even be clicked, the same shape as an autoplay countdown, just pointed at the exit instead of the next episode.',
  anticipation:
    'Both options were equally easy again, but "continue" now came with a specific, unresolved detail. Nothing about the interface changed; only what you were told about what came next.',
};

export interface RoundSummary extends RoundResponse {
  roundNumber: number;
  note: string;
}

export function summarize(state: ExperimentState): RoundSummary[] {
  return state.responses.map((response, index) => ({
    ...response,
    roundNumber: index + 1,
    note: MECHANISM_NOTES[response.mechanism],
  }));
}

export function continueCount(state: ExperimentState): number {
  return state.responses.filter((response) => response.choice === "continue").length;
}
