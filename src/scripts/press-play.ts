// Pure, DOM-free logic for the Week 2 "Browse Screen" experiment. A component
// wires this to the page; nothing here touches the DOM, so it's unit-testable
// on its own (see spec/press-play.test.ts).
//
// Deliberately not a copy of Week 1's continue/stop mechanic: this is a
// pick-one-of-three task, because Week 2's question ("why do we press play
// in the first place?") is about what makes someone start a show, not what
// makes someone keep watching one already playing.

export type Cue = "baseline" | "social-proof" | "curiosity-gap";

export interface ShowOption {
  id: string;
  title: string;
  synopsis: string;
  badge: string | null;
}

export interface RoundConfig {
  id: string;
  cue: Cue;
  prompt: string;
  options: readonly ShowOption[];
  /** id of the option carrying this round's cue, or null when nothing is cued (baseline). */
  cuedOptionId: string | null;
}

export const ROUNDS: readonly RoundConfig[] = [
  {
    id: "round-1",
    cue: "baseline",
    prompt: "Three shows you know nothing about. Pick one to start.",
    cuedOptionId: null,
    options: [
      { id: "a", title: "Low Tide", synopsis: "A coastal town drama.", badge: null },
      { id: "b", title: "Signal Loss", synopsis: "A workplace thriller.", badge: null },
      { id: "c", title: "Paper Moon", synopsis: "A family comedy.", badge: null },
    ],
  },
  {
    id: "round-2",
    cue: "social-proof",
    prompt: "Same kind of choice. Pick one to start.",
    cuedOptionId: "b",
    options: [
      { id: "a", title: "Low Tide", synopsis: "A coastal town drama.", badge: null },
      {
        id: "b",
        title: "Signal Loss",
        synopsis: "A workplace thriller.",
        badge: "97% match · Trending #1",
      },
      { id: "c", title: "Paper Moon", synopsis: "A family comedy.", badge: null },
    ],
  },
  {
    id: "round-3",
    cue: "curiosity-gap",
    prompt: "Same kind of choice again. Pick one to start.",
    cuedOptionId: "a",
    options: [
      {
        id: "a",
        title: "Low Tide",
        synopsis: "She answers the door. It's her, twenty years younger, and she wants to talk.",
        badge: null,
      },
      { id: "b", title: "Signal Loss", synopsis: "A workplace thriller.", badge: null },
      { id: "c", title: "Paper Moon", synopsis: "A family comedy.", badge: null },
    ],
  },
] as const;

export interface RoundResponse {
  cue: Cue;
  pickedOptionId: string;
  pickedCuedOption: boolean;
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

export function recordPick(state: ExperimentState, optionId: string): ExperimentState {
  const round = currentRound(state);
  if (!round) return state;
  return {
    roundIndex: state.roundIndex + 1,
    responses: [
      ...state.responses,
      {
        cue: round.cue,
        pickedOptionId: optionId,
        pickedCuedOption: round.cuedOptionId === optionId,
      },
    ],
  };
}

const CUE_NOTES: Record<Cue, string> = {
  baseline: "All three shows were presented identically — nothing pointed you toward any one of them.",
  "social-proof":
    'One show carried a "97% match · Trending #1" badge — a signal about what other people already chose, not any information about the show itself.',
  "curiosity-gap":
    "One show's description posed an unresolved question instead of describing the plot — the same unfinished-information pull Week 1 used to keep people watching, aimed here at the moment of choosing what to start.",
};

export interface RoundSummary extends RoundResponse {
  roundNumber: number;
  note: string;
}

export function summarize(state: ExperimentState): RoundSummary[] {
  return state.responses.map((response, index) => ({
    ...response,
    roundNumber: index + 1,
    note: CUE_NOTES[response.cue],
  }));
}

/** How many of the two manipulated rounds (2 and 3) landed on the cued option. */
export function cuedPickCount(state: ExperimentState): number {
  return state.responses.filter((response) => response.cue !== "baseline" && response.pickedCuedOption)
    .length;
}
