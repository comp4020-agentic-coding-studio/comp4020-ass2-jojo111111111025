import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  TILES_PER_ROUND,
  TOTAL_ROUNDS,
  createInitialState,
  currentRound,
  isComplete,
  recordPick,
  summarize,
} from "../src/scripts/narrowing-feed";

// Unit tests for the Week 8 interaction's own logic (src/scripts/narrowing-feed.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("narrowing-feed experiment", () => {
  it("starts fully diverse: one tile per category, all four categories represented", () => {
    const state = createInitialState();
    const round = currentRound(state);
    expect(round).not.toBeNull();
    expect(round?.tiles).toHaveLength(TILES_PER_ROUND);
    expect(round?.diversity).toBe(CATEGORIES.length);
    expect(isComplete(state)).toBe(false);
  });

  it("every round always has exactly TILES_PER_ROUND tiles", () => {
    let state = createInitialState();
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const round = currentRound(state)!;
      expect(round.tiles).toHaveLength(TILES_PER_ROUND);
      state = recordPick(state, "comedy");
    }
  });

  it("recordPick advances immutably and narrows the next round toward the picked category", () => {
    const state0 = createInitialState();
    const state1 = recordPick(state0, "comedy");
    expect(state0.roundIndex).toBe(0); // unchanged
    expect(state1.roundIndex).toBe(1);

    const round2 = currentRound(state1)!;
    const comedyCount = round2.tiles.filter((t) => t.category === "comedy").length;
    expect(comedyCount).toBeGreaterThan(1); // more than the one-per-category baseline
  });

  it("repeatedly picking the same category strictly narrows diversity toward 1", () => {
    let state = createInitialState();
    const diversities: number[] = [];
    while (!isComplete(state)) {
      diversities.push(currentRound(state)!.diversity);
      state = recordPick(state, "thriller");
    }
    expect(diversities[0]).toBe(CATEGORIES.length);
    expect(diversities[diversities.length - 1]).toBeLessThan(diversities[0]);
    // Non-increasing overall — narrowing never reverses itself under a single-category pick pattern.
    for (let i = 1; i < diversities.length; i++) {
      expect(diversities[i]).toBeLessThanOrEqual(diversities[i - 1]);
    }
  });

  it("is complete only after TOTAL_ROUNDS picks", () => {
    let state = createInitialState();
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      expect(isComplete(state)).toBe(false);
      state = recordPick(state, "drama");
    }
    expect(isComplete(state)).toBe(true);
    expect(currentRound(state)).toBeNull();
  });

  it("does nothing once already complete", () => {
    let state = createInitialState();
    for (let i = 0; i < TOTAL_ROUNDS; i++) state = recordPick(state, "documentary");
    const finished = state;
    expect(recordPick(finished, "comedy")).toEqual(finished);
  });

  it("summarize reports one pick per round with a matching label, and both diversity endpoints", () => {
    let state = createInitialState();
    for (let i = 0; i < TOTAL_ROUNDS; i++) state = recordPick(state, "comedy");
    const summary = summarize(state);
    expect(summary.picks).toHaveLength(TOTAL_ROUNDS);
    expect(summary.picks.every((p) => p.label.length > 0)).toBe(true);
    expect(summary.startingDiversity).toBe(CATEGORIES.length);
    expect(summary.endingDiversity).toBeLessThan(summary.startingDiversity);
  });
});
