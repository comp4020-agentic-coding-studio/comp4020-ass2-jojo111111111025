// Pure, DOM-free logic for the Week 6 "Guessing Clock" experiment. A component
// wires this to the page; nothing here touches the DOM, the clock, or a
// timer — it only records and interprets estimates the component hands it
// (see spec/time-perception.test.ts).
//
// Deliberately not a copy of Week 1's continue/stop choice or Week 2's
// pick-one-of-three: this is a continuous-estimate task. The visitor isn't
// choosing between options — they're guessing a number, and that number is
// scored against a real elapsed duration the component measured with
// performance.now(). This module never measures time itself; it only takes
// the measured value as an argument, so it stays deterministic and
// unit-testable without ever actually waiting.

export type Condition = "baseline" | "absorbing" | "monotonous";

export interface RoundConfig {
  id: string;
  condition: Condition;
  /** The real duration every round runs for. Identical across all three rounds by design. */
  actualDurationMs: number;
  /** Lines the component cycles through while the round is running. */
  fillerLines: readonly string[];
  /** How often the component should advance fillerLines, in ms. 0 = never (fully static). */
  cycleMs: number;
  sliderMinSeconds: number;
  sliderMaxSeconds: number;
}

export const ROUNDS: readonly RoundConfig[] = [
  {
    id: "round-1",
    condition: "baseline",
    actualDurationMs: 11_000,
    fillerLines: ["The screen is holding on a plain, still shot of an empty hallway."],
    cycleMs: 0,
    sliderMinSeconds: 0,
    sliderMaxSeconds: 40,
  },
  {
    id: "round-2",
    condition: "absorbing",
    actualDurationMs: 11_000,
    fillerLines: [
      "Cut: a door being locked from the inside.",
      "Cut: a phone lighting up on a table.",
      "Cut: a name being crossed off a list.",
      "Cut: a car pulling out of a driveway.",
      "Cut: a light switching off upstairs.",
    ],
    cycleMs: 1_200,
    sliderMinSeconds: 0,
    sliderMaxSeconds: 40,
  },
  {
    id: "round-3",
    condition: "monotonous",
    actualDurationMs: 11_000,
    fillerLines: ["Waiting."],
    cycleMs: 3_000,
    sliderMinSeconds: 0,
    sliderMaxSeconds: 40,
  },
] as const;

export const ACCURACY_TOLERANCE_SECONDS = 1.5;

export type Classification = "overestimate" | "underestimate" | "accurate";

export interface RoundResponse {
  condition: Condition;
  actualDurationMs: number;
  /** The real elapsed time the component measured for this round, via performance.now(). */
  actualElapsedMs: number;
  estimatedSeconds: number;
  signedErrorSeconds: number;
  classification: Classification;
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

export function clampEstimate(round: RoundConfig, estimatedSeconds: number): number {
  return Math.min(Math.max(estimatedSeconds, round.sliderMinSeconds), round.sliderMaxSeconds);
}

export function classify(signedErrorSeconds: number): Classification {
  if (Math.abs(signedErrorSeconds) <= ACCURACY_TOLERANCE_SECONDS) return "accurate";
  return signedErrorSeconds > 0 ? "overestimate" : "underestimate";
}

export function recordEstimate(
  state: ExperimentState,
  estimatedSeconds: number,
  actualElapsedMs: number,
): ExperimentState {
  const round = currentRound(state);
  if (!round) return state;

  const clamped = clampEstimate(round, estimatedSeconds);
  const signedErrorSeconds = clamped - actualElapsedMs / 1000;

  return {
    roundIndex: state.roundIndex + 1,
    responses: [
      ...state.responses,
      {
        condition: round.condition,
        actualDurationMs: round.actualDurationMs,
        actualElapsedMs,
        estimatedSeconds: clamped,
        signedErrorSeconds,
        classification: classify(signedErrorSeconds),
      },
    ],
  };
}

const CONDITION_NOTES: Record<Condition, string> = {
  baseline:
    "Nothing was designed to speed up or slow down the wait — a plain, unchanging scene, with nothing new to attend to.",
  absorbing:
    "The screen kept giving you something new to notice, several times a second, for the exact same length of time as the baseline round.",
  monotonous:
    "The same, information-free line repeated on a slow, steady beat — something visibly happened, but nothing new was ever said, for the exact same length of time as the baseline round.",
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

export interface ConditionComparison {
  baselineEstimateSeconds: number;
  absorbingEstimateSeconds: number;
  monotonousEstimateSeconds: number;
  /** Negative = the absorbing round felt shorter than baseline. */
  absorbingMinusBaselineSeconds: number;
  /** Positive = the monotonous round felt longer than baseline. */
  monotonousMinusBaselineSeconds: number;
}

/** Only meaningful once all three rounds are in — returns null otherwise. */
export function compareConditions(state: ExperimentState): ConditionComparison | null {
  const baseline = state.responses.find((response) => response.condition === "baseline");
  const absorbing = state.responses.find((response) => response.condition === "absorbing");
  const monotonous = state.responses.find((response) => response.condition === "monotonous");
  if (!baseline || !absorbing || !monotonous) return null;

  return {
    baselineEstimateSeconds: baseline.estimatedSeconds,
    absorbingEstimateSeconds: absorbing.estimatedSeconds,
    monotonousEstimateSeconds: monotonous.estimatedSeconds,
    absorbingMinusBaselineSeconds: absorbing.estimatedSeconds - baseline.estimatedSeconds,
    monotonousMinusBaselineSeconds: monotonous.estimatedSeconds - baseline.estimatedSeconds,
  };
}
