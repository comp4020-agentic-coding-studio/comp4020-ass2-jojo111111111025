// Pure, DOM-free logic for the Week 9 "Two Identical Rows" experiment. A
// component wires this to the page; nothing here touches the DOM (see
// spec/social-signal.test.ts).
//
// Deliberately not Week 2's three-tile, three-round social-proof round: this
// isolates the social signal itself by keeping exactly two, otherwise
// interchangeable shows on screen every round, and moving which slot (left
// or right) carries a cue between rounds so the pattern isn't "people pick
// the left tile." One round carries no cue at all, as a baseline for
// whichever slot a visitor favours with nothing attached to either option.

export type CueType = "none" | "crowd" | "friend";
export type Slot = "left" | "right";

export interface ShowOption {
  id: string;
  title: string;
  synopsis: string;
}

/** Two deliberately interchangeable shows — same format, same generic pitch, no other reason to prefer either. */
export const SHOWS: readonly [ShowOption, ShowOption] = [
  { id: "late-shift", title: "Late Shift", synopsis: "A workplace drama set over one long night." },
  { id: "small-hours", title: "Small Hours", synopsis: "A workplace drama set over one long night." },
];

export interface RoundConfig {
  id: string;
  cueType: CueType;
  /** Which slot carries the cue this round; null when cueType is "none". */
  cueSlot: Slot | null;
}

export const ROUNDS: readonly RoundConfig[] = [
  { id: "round-1", cueType: "none", cueSlot: null },
  { id: "round-2", cueType: "crowd", cueSlot: "left" },
  { id: "round-3", cueType: "friend", cueSlot: "right" },
  { id: "round-4", cueType: "crowd", cueSlot: "right" },
] as const;

const CUE_TEXT: Record<Exclude<CueType, "none">, string> = {
  crowd: "12,400 people watching right now",
  friend: "Your friend Alex is watching this",
};

export function cueTextFor(cueType: CueType): string | null {
  return cueType === "none" ? null : CUE_TEXT[cueType];
}

export interface RoundResponse {
  cueType: CueType;
  cueSlot: Slot | null;
  pickedSlot: Slot;
  /** true if the visitor picked the cued slot; null for the baseline round, which has no cue. */
  pickedCuedSlot: boolean | null;
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

/** Records which slot the visitor picked this round. A no-op once complete. */
export function recordPick(state: ExperimentState, pickedSlot: Slot): ExperimentState {
  const round = currentRound(state);
  if (!round) return state;

  const pickedCuedSlot = round.cueSlot === null ? null : pickedSlot === round.cueSlot;

  return {
    roundIndex: state.roundIndex + 1,
    responses: [
      ...state.responses,
      { cueType: round.cueType, cueSlot: round.cueSlot, pickedSlot, pickedCuedSlot },
    ],
  };
}

export function cuedPickCount(state: ExperimentState): number {
  return state.responses.filter((r) => r.pickedCuedSlot === true).length;
}

export function cuedRoundCount(state: ExperimentState): number {
  return state.responses.filter((r) => r.pickedCuedSlot !== null).length;
}

const NOTE: Record<CueType, string> = {
  none: "No cue on either option — this is the baseline slot preference to compare the other rounds against.",
  crowd: "A crowd-size cue was attached to one option — it says nothing about the show itself, only that many other people are watching it.",
  friend: "A named-friend cue was attached to one option — a specific, familiar name rather than an anonymous crowd count.",
};

export interface RoundSummary extends RoundResponse {
  roundNumber: number;
  note: string;
}

export function summarize(state: ExperimentState): RoundSummary[] {
  return state.responses.map((response, index) => ({
    ...response,
    roundNumber: index + 1,
    note: NOTE[response.cueType],
  }));
}
