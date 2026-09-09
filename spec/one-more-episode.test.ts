import { describe, expect, it } from "vitest";
import {
  ROUNDS,
  continueCount,
  createInitialState,
  currentRound,
  isComplete,
  recordChoice,
  summarize,
} from "../src/scripts/one-more-episode";

// Unit tests for the Week 1 interaction's own logic (src/scripts/one-more-episode.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("one-more-episode experiment", () => {
  it("starts with no responses and the first round current", () => {
    const state = createInitialState();
    expect(state.responses).toEqual([]);
    expect(currentRound(state)?.id).toBe("round-1");
    expect(isComplete(state)).toBe(false);
  });

  it("advances one round per choice, without mutating the previous state", () => {
    const state0 = createInitialState();
    const state1 = recordChoice(state0, "continue");
    expect(state0.responses).toEqual([]); // unchanged
    expect(state1.responses).toEqual([{ mechanism: "baseline", choice: "continue" }]);
    expect(currentRound(state1)?.id).toBe("round-2");
  });

  it("is complete only after a choice has been recorded for every round", () => {
    let state = createInitialState();
    for (let i = 0; i < ROUNDS.length; i++) {
      expect(isComplete(state)).toBe(false);
      state = recordChoice(state, "stop");
    }
    expect(isComplete(state)).toBe(true);
    expect(currentRound(state)).toBeNull();
  });

  it("does nothing once already complete", () => {
    let state = createInitialState();
    for (let i = 0; i < ROUNDS.length; i++) state = recordChoice(state, "continue");
    const finished = state;
    expect(recordChoice(finished, "stop")).toEqual(finished);
  });

  it("manipulates exactly one round with stop-side friction, and one with a teaser", () => {
    const withDelay = ROUNDS.filter((round) => round.stopDelaySeconds > 0);
    const withTeaser = ROUNDS.filter((round) => round.teaserText !== null);
    expect(withDelay).toHaveLength(1);
    expect(withDelay[0]?.mechanism).toBe("friction");
    expect(withTeaser).toHaveLength(1);
    expect(withTeaser[0]?.mechanism).toBe("anticipation");
  });

  it("summarizes each round with its mechanism and a plain-language note", () => {
    let state = createInitialState();
    state = recordChoice(state, "continue");
    state = recordChoice(state, "stop");
    state = recordChoice(state, "continue");
    const summary = summarize(state);
    expect(summary.map((s) => s.roundNumber)).toEqual([1, 2, 3]);
    expect(summary.map((s) => s.mechanism)).toEqual(["baseline", "friction", "anticipation"]);
    expect(summary.every((s) => s.note.length > 0)).toBe(true);
    expect(continueCount(state)).toBe(2);
  });
});
