import { describe, expect, it } from "vitest";
import {
  EPISODE_COST_MINUTES,
  STARTING_BUDGET_MINUTES,
  canAffordAnother,
  classifyRest,
  createInitialState,
  isComplete,
  stopForSleep,
  summarize,
  watchOne,
} from "../src/scripts/sleep-ledger";

// Unit tests for the Week 10 interaction's own logic (src/scripts/sleep-ledger.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("sleep-ledger experiment", () => {
  it("starts with the full budget, no episodes watched, not stopped", () => {
    const state = createInitialState();
    expect(state.remainingMinutes).toBe(STARTING_BUDGET_MINUTES);
    expect(state.episodesWatched).toBe(0);
    expect(isComplete(state)).toBe(false);
  });

  it("watchOne spends exactly one fixed episode cost, immutably", () => {
    const state0 = createInitialState();
    const state1 = watchOne(state0);
    expect(state0.remainingMinutes).toBe(STARTING_BUDGET_MINUTES); // unchanged
    expect(state1.remainingMinutes).toBe(STARTING_BUDGET_MINUTES - EPISODE_COST_MINUTES);
    expect(state1.episodesWatched).toBe(1);
  });

  it("the per-episode cost never changes across repeated watches", () => {
    let state = createInitialState();
    const spent: number[] = [];
    for (let i = 0; i < 5; i++) {
      const before = state.remainingMinutes;
      state = watchOne(state);
      spent.push(before - state.remainingMinutes);
    }
    expect(new Set(spent).size).toBe(1);
    expect(spent[0]).toBe(EPISODE_COST_MINUTES);
  });

  it("stopForSleep ends the session without spending more budget", () => {
    let state = createInitialState();
    state = watchOne(state);
    const before = state.remainingMinutes;
    state = stopForSleep(state);
    expect(isComplete(state)).toBe(true);
    expect(state.remainingMinutes).toBe(before);
  });

  it("watchOne is a no-op once stopped", () => {
    let state = createInitialState();
    state = stopForSleep(state);
    expect(watchOne(state)).toEqual(state);
  });

  it("becomes complete automatically once the budget can no longer afford another episode", () => {
    let state = createInitialState();
    while (canAffordAnother(state)) {
      expect(isComplete(state)).toBe(false);
      state = watchOne(state);
    }
    expect(isComplete(state)).toBe(true);
    expect(state.remainingMinutes).toBeLessThan(EPISODE_COST_MINUTES);
    expect(state.remainingMinutes).toBeGreaterThanOrEqual(0);
  });

  it("watchOne is a no-op once the budget is exhausted", () => {
    let state = createInitialState();
    while (canAffordAnother(state)) state = watchOne(state);
    const exhausted = state;
    expect(watchOne(exhausted)).toEqual(exhausted);
  });

  it("classifyRest applies the fixed thresholds correctly", () => {
    expect(classifyRest(480)).toBe("full-night");
    expect(classifyRest(420)).toBe("full-night");
    expect(classifyRest(419)).toBe("slightly-short");
    expect(classifyRest(360)).toBe("slightly-short");
    expect(classifyRest(359)).toBe("notably-short");
    expect(classifyRest(240)).toBe("notably-short");
    expect(classifyRest(239)).toBe("very-short");
    expect(classifyRest(0)).toBe("very-short");
  });

  it("summarize reports episodes watched, remaining budget, and a matching rest label", () => {
    let state = createInitialState();
    state = watchOne(state);
    state = watchOne(state);
    state = stopForSleep(state);
    const summary = summarize(state);
    expect(summary.episodesWatched).toBe(2);
    expect(summary.remainingMinutes).toBe(STARTING_BUDGET_MINUTES - 2 * EPISODE_COST_MINUTES);
    expect(summary.restLevel).toBe(classifyRest(summary.remainingMinutes));
    expect(summary.restLevelLabel.length).toBeGreaterThan(0);
  });
});
