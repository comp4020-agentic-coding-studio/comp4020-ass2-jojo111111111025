import { describe, expect, it } from "vitest";
import {
  INTERVENTION_POINTS,
  MAX_LAPS,
  STAGES,
  compareAll,
  createInitialState,
  isComplete,
  recordTry,
  remainingPoints,
  runLoop,
} from "../src/scripts/breaking-the-loop";

// Unit tests for the Week 11 interaction's own logic (src/scripts/breaking-the-loop.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("breaking-the-loop experiment", () => {
  it("defines one lap as a fixed five-stage sequence", () => {
    expect(STAGES.map((s) => s.id)).toEqual(["cue", "episode", "autoplay", "reward", "recommendation"]);
  });

  it("exposes exactly three valid intervention points", () => {
    expect(INTERVENTION_POINTS).toEqual(["none", "early", "late"]);
  });

  it("no-intervention runs the full illustrative cap of laps", () => {
    const result = runLoop("none");
    expect(result.stoppedEarly).toBe(false);
    expect(result.episodesWatched).toBe(MAX_LAPS);
    expect(result.steps.length).toBe(MAX_LAPS * STAGES.length);
    expect(result.steps.every((step) => !step.intervened)).toBe(true);
  });

  it("early intervention stops the loop inside lap 1, before it repeats even once", () => {
    const result = runLoop("early");
    expect(result.stoppedEarly).toBe(true);
    expect(result.episodesWatched).toBe(1);
    expect(result.steps.at(-1)).toMatchObject({ lap: 1, stageId: "autoplay", intervened: true });
  });

  it("late intervention lets several laps complete before stopping", () => {
    const result = runLoop("late");
    expect(result.stoppedEarly).toBe(true);
    expect(result.episodesWatched).toBe(3);
    expect(result.steps.at(-1)).toMatchObject({ lap: 3, stageId: "autoplay", intervened: true });
  });

  it("exactly one step is flagged intervened, and only for a real intervention", () => {
    for (const point of INTERVENTION_POINTS) {
      const result = runLoop(point);
      const flagged = result.steps.filter((step) => step.intervened);
      expect(flagged.length).toBe(point === "none" ? 0 : 1);
    }
  });

  it("resulting sequences are strictly ordered by lap and never skip a stage", () => {
    const result = runLoop("late");
    let lap = 1;
    let stageIndex = 0;
    for (const step of result.steps) {
      expect(step.lap).toBe(lap);
      expect(step.stageId).toBe(STAGES[stageIndex]!.id);
      stageIndex++;
      if (stageIndex === STAGES.length) {
        stageIndex = 0;
        lap++;
      }
    }
  });

  it("comparison shows early stops the loop soonest and none runs longest", () => {
    const comparison = compareAll();
    expect(comparison.early.episodesWatched).toBeLessThan(comparison.late.episodesWatched);
    expect(comparison.late.episodesWatched).toBeLessThan(comparison.none.episodesWatched);
  });

  it("runLoop never mutates STAGES or produces shared step references across calls", () => {
    const first = runLoop("none");
    const second = runLoop("none");
    expect(first.steps).not.toBe(second.steps);
    expect(STAGES.length).toBe(5);
  });

  it("starts with nothing tried, and is not complete", () => {
    const state = createInitialState();
    expect(state.tried).toEqual([]);
    expect(isComplete(state)).toBe(false);
    expect(remainingPoints(state)).toEqual(["none", "early", "late"]);
  });

  it("recordTry adds a point immutably and is a no-op if already tried", () => {
    const state0 = createInitialState();
    const state1 = recordTry(state0, "early");
    expect(state0.tried).toEqual([]); // unchanged
    expect(state1.tried).toEqual(["early"]);

    const state2 = recordTry(state1, "early");
    expect(state2).toEqual(state1); // no-op, already tried
  });

  it("becomes complete only once all three intervention points have been tried", () => {
    let state = createInitialState();
    state = recordTry(state, "none");
    expect(isComplete(state)).toBe(false);
    state = recordTry(state, "early");
    expect(isComplete(state)).toBe(false);
    state = recordTry(state, "late");
    expect(isComplete(state)).toBe(true);
    expect(remainingPoints(state)).toEqual([]);
  });
});
