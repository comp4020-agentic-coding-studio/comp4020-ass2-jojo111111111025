import { describe, expect, it } from "vitest";
import {
  ENDINGS,
  concordantPairs,
  confirmRanking,
  createInitialState,
  isComplete,
  moveDown,
  moveUp,
  summarize,
  totalPairs,
} from "../src/scripts/cliffhanger-ranking";

// Unit tests for the Week 3 interaction's own logic (src/scripts/cliffhanger-ranking.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("cliffhanger-ranking experiment", () => {
  it("starts with a scrambled order, unconfirmed", () => {
    const state = createInitialState();
    expect(state.order).toHaveLength(ENDINGS.length);
    expect(new Set(state.order).size).toBe(ENDINGS.length); // every ending present exactly once
    expect(isComplete(state)).toBe(false);
  });

  it("moveUp swaps with the previous item, without mutating the previous state", () => {
    const state0 = createInitialState();
    const state1 = moveUp(state0, 1);
    expect(state0.order).toEqual(createInitialState().order); // unchanged
    expect(state1.order[0]).toBe(state0.order[1]);
    expect(state1.order[1]).toBe(state0.order[0]);
  });

  it("moveUp on the first item is a no-op", () => {
    const state = createInitialState();
    expect(moveUp(state, 0)).toEqual(state);
  });

  it("moveDown swaps with the next item", () => {
    const state0 = createInitialState();
    const state1 = moveDown(state0, 0);
    expect(state1.order[0]).toBe(state0.order[1]);
    expect(state1.order[1]).toBe(state0.order[0]);
  });

  it("moveDown on the last item is a no-op", () => {
    const state = createInitialState();
    const lastIndex = state.order.length - 1;
    expect(moveDown(state, lastIndex)).toEqual(state);
  });

  it("every move preserves the same set of ids — nothing is lost or duplicated", () => {
    let state = createInitialState();
    state = moveUp(state, 2);
    state = moveDown(state, 0);
    state = moveUp(state, 3);
    expect(new Set(state.order)).toEqual(new Set(ENDINGS.map((e) => e.id)));
  });

  it("confirmRanking locks the state and moves become no-ops afterward", () => {
    let state = createInitialState();
    state = confirmRanking(state);
    expect(isComplete(state)).toBe(true);
    const beforeOrder = state.order;
    state = moveUp(state, 2);
    state = moveDown(state, 0);
    expect(state.order).toEqual(beforeOrder);
    expect(confirmRanking(state)).toEqual(state); // confirming again is a no-op
  });

  it("has four endings with four distinct illustrative info-gap scores", () => {
    const scores = ENDINGS.map((e) => e.infoGapScore);
    expect(new Set(scores).size).toBe(ENDINGS.length);
  });

  it("computes 6 total pairs for four endings, and full concordance for the expected order", () => {
    // Build a state whose order exactly matches ascending info-gap score.
    const sorted = [...ENDINGS].sort((a, b) => a.infoGapScore - b.infoGapScore).map((e) => e.id);
    const state = { order: sorted, confirmed: false };
    expect(totalPairs(state)).toBe(6);
    expect(concordantPairs(state)).toBe(6);
  });

  it("computes fewer concordant pairs for a reversed order", () => {
    const sorted = [...ENDINGS].sort((a, b) => b.infoGapScore - a.infoGapScore).map((e) => e.id);
    const state = { order: sorted, confirmed: false };
    expect(concordantPairs(state)).toBe(0);
  });

  it("summarizes the confirmed order with positions, labels, and the expected order", () => {
    let state = createInitialState();
    state = confirmRanking(state);
    const summary = summarize(state);
    expect(summary.order.map((item) => item.position)).toEqual([1, 2, 3, 4]);
    expect(summary.order.every((item) => item.label.length > 0)).toBe(true);
    expect(summary.expectedOrder).toHaveLength(4);
    expect(summary.totalPairs).toBe(6);
  });
});
