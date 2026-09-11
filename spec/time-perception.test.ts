import { describe, expect, it } from "vitest";
import {
  ACCURACY_TOLERANCE_SECONDS,
  ROUNDS,
  classify,
  clampEstimate,
  compareConditions,
  createInitialState,
  currentRound,
  isComplete,
  recordEstimate,
  summarize,
} from "../src/scripts/time-perception";

// Unit tests for the Week 6 interaction's own logic (src/scripts/time-perception.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("time-perception experiment", () => {
  it("starts with no responses and the first round current", () => {
    const state = createInitialState();
    expect(state.responses).toEqual([]);
    expect(currentRound(state)?.id).toBe("round-1");
    expect(isComplete(state)).toBe(false);
  });

  it("advances one round per estimate, without mutating the previous state", () => {
    const state0 = createInitialState();
    const state1 = recordEstimate(state0, 10, 11_000);
    expect(state0.responses).toEqual([]); // unchanged
    expect(state1.responses).toHaveLength(1);
    expect(state1.responses[0]?.condition).toBe("baseline");
    expect(currentRound(state1)?.id).toBe("round-2");
  });

  it("is complete only after an estimate has been recorded for every round", () => {
    let state = createInitialState();
    for (let i = 0; i < ROUNDS.length; i++) {
      expect(isComplete(state)).toBe(false);
      state = recordEstimate(state, 11, 11_000);
    }
    expect(isComplete(state)).toBe(true);
    expect(currentRound(state)).toBeNull();
  });

  it("does nothing once already complete", () => {
    let state = createInitialState();
    for (const round of ROUNDS) state = recordEstimate(state, 11, round.actualDurationMs);
    const finished = state;
    expect(recordEstimate(finished, 20, 11_000)).toEqual(finished);
  });

  it("has exactly one baseline, one absorbing, and one monotonous round", () => {
    const baseline = ROUNDS.filter((round) => round.condition === "baseline");
    const absorbing = ROUNDS.filter((round) => round.condition === "absorbing");
    const monotonous = ROUNDS.filter((round) => round.condition === "monotonous");
    expect(baseline).toHaveLength(1);
    expect(absorbing).toHaveLength(1);
    expect(monotonous).toHaveLength(1);
  });

  it("configures every round with the exact same real duration", () => {
    const durations = new Set(ROUNDS.map((round) => round.actualDurationMs));
    expect(durations.size).toBe(1);
  });

  it("computes signed error as estimate minus actual elapsed seconds", () => {
    let state = createInitialState();
    state = recordEstimate(state, 15, 11_000); // 15s guess, 11s actually elapsed
    expect(state.responses[0]?.signedErrorSeconds).toBeCloseTo(4, 5);
  });

  it("classifies overestimate, underestimate, and accurate correctly", () => {
    expect(classify(4)).toBe("overestimate");
    expect(classify(-6)).toBe("underestimate");
    expect(classify(0)).toBe("accurate");
    expect(classify(ACCURACY_TOLERANCE_SECONDS)).toBe("accurate");
    expect(classify(ACCURACY_TOLERANCE_SECONDS + 0.01)).toBe("overestimate");
    expect(classify(-ACCURACY_TOLERANCE_SECONDS - 0.01)).toBe("underestimate");
  });

  it("clamps an out-of-range estimate to the round's configured slider bounds", () => {
    const round = ROUNDS[0]!;
    expect(clampEstimate(round, -5)).toBe(round.sliderMinSeconds);
    expect(clampEstimate(round, 999)).toBe(round.sliderMaxSeconds);
    expect(clampEstimate(round, 12)).toBe(12);
  });

  it("clamps estimates recorded through recordEstimate, not just via clampEstimate directly", () => {
    let state = createInitialState();
    state = recordEstimate(state, -5, 11_000);
    expect(state.responses[0]?.estimatedSeconds).toBe(ROUNDS[0]!.sliderMinSeconds);
  });

  it("summarizes each round with its condition and a plain-language note", () => {
    let state = createInitialState();
    state = recordEstimate(state, 9, 11_000);
    state = recordEstimate(state, 6, 11_000);
    state = recordEstimate(state, 16, 11_000);
    const summary = summarize(state);
    expect(summary.map((s) => s.roundNumber)).toEqual([1, 2, 3]);
    expect(summary.map((s) => s.condition)).toEqual(["baseline", "absorbing", "monotonous"]);
    expect(summary.every((s) => s.note.length > 0)).toBe(true);
  });

  it("returns null from compareConditions until all three rounds are recorded", () => {
    let state = createInitialState();
    expect(compareConditions(state)).toBeNull();
    state = recordEstimate(state, 9, 11_000);
    expect(compareConditions(state)).toBeNull();
  });

  it("compares absorbing and monotonous estimates against the baseline", () => {
    let state = createInitialState();
    state = recordEstimate(state, 9, 11_000); // baseline
    state = recordEstimate(state, 6, 11_000); // absorbing — felt shorter
    state = recordEstimate(state, 16, 11_000); // monotonous — felt longer
    const comparison = compareConditions(state);
    expect(comparison).not.toBeNull();
    expect(comparison?.baselineEstimateSeconds).toBe(9);
    expect(comparison?.absorbingEstimateSeconds).toBe(6);
    expect(comparison?.monotonousEstimateSeconds).toBe(16);
    expect(comparison?.absorbingMinusBaselineSeconds).toBe(-3);
    expect(comparison?.monotonousMinusBaselineSeconds).toBe(7);
  });
});
