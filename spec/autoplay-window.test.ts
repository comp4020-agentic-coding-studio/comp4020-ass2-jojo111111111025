import { describe, expect, it } from "vitest";
import {
  ROUNDS,
  autoplayedCount,
  createInitialState,
  currentRound,
  isComplete,
  recordOutcome,
  summarize,
} from "../src/scripts/autoplay-window";

// Unit tests for the Week 4 interaction's own logic (src/scripts/autoplay-window.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("autoplay-window experiment", () => {
  it("starts with no responses and the first round current", () => {
    const state = createInitialState();
    expect(state.responses).toEqual([]);
    expect(currentRound(state)?.id).toBe("round-1");
    expect(isComplete(state)).toBe(false);
  });

  it("advances one round per outcome, without mutating the previous state", () => {
    const state0 = createInitialState();
    const state1 = recordOutcome(state0, 5_000);
    expect(state0.responses).toEqual([]); // unchanged
    expect(state1.responses).toHaveLength(1);
    expect(state1.responses[0]?.condition).toBe("baseline");
    expect(currentRound(state1)?.id).toBe("round-2");
  });

  it("is complete only after an outcome has been recorded for every round", () => {
    let state = createInitialState();
    for (let i = 0; i < ROUNDS.length; i++) {
      expect(isComplete(state)).toBe(false);
      state = recordOutcome(state, null);
    }
    expect(isComplete(state)).toBe(true);
    expect(currentRound(state)).toBeNull();
  });

  it("does nothing once already complete", () => {
    let state = createInitialState();
    for (const round of ROUNDS) state = recordOutcome(state, round.countdownMs);
    const finished = state;
    expect(recordOutcome(finished, 1_000)).toEqual(finished);
  });

  it("has exactly one baseline, one buried, and one silent round", () => {
    const conditions = ROUNDS.map((round) => round.condition).sort();
    expect(conditions).toEqual(["baseline", "buried", "silent"]);
  });

  it("holds the countdown duration constant across all three rounds", () => {
    const durations = new Set(ROUNDS.map((round) => round.countdownMs));
    expect(durations.size).toBe(1);
  });

  it("classifies null remaining time as autoplayed", () => {
    let state = createInitialState();
    state = recordOutcome(state, null);
    expect(state.responses[0]?.outcome).toBe("autoplayed");
    expect(state.responses[0]?.remainingMsAtInterrupt).toBeNull();
  });

  it("classifies an interrupt in the first half of the window as early, second half as late", () => {
    let state = createInitialState();
    const countdown = ROUNDS[0]!.countdownMs;
    state = recordOutcome(state, countdown * 0.9); // lots of time left
    expect(state.responses[0]?.outcome).toBe("interrupted-early");

    state = createInitialState();
    state = recordOutcome(state, countdown * 0.1); // almost none left
    expect(state.responses[0]?.outcome).toBe("interrupted-late");
  });

  it("clamps an out-of-range remaining time to the round's countdown bounds", () => {
    let state = createInitialState();
    state = recordOutcome(state, -500);
    expect(state.responses[0]?.remainingMsAtInterrupt).toBe(0);

    state = createInitialState();
    state = recordOutcome(state, 999_999);
    expect(state.responses[0]?.remainingMsAtInterrupt).toBe(ROUNDS[0]!.countdownMs);
  });

  it("counts autoplayed rounds and summarizes each round with a plain-language note", () => {
    let state = createInitialState();
    state = recordOutcome(state, 5_000); // interrupted, baseline
    state = recordOutcome(state, null); // autoplayed, buried
    state = recordOutcome(state, null); // autoplayed, silent
    expect(autoplayedCount(state)).toBe(2);

    const summary = summarize(state);
    expect(summary.map((s) => s.roundNumber)).toEqual([1, 2, 3]);
    expect(summary.map((s) => s.condition)).toEqual(["baseline", "buried", "silent"]);
    expect(summary.every((s) => s.note.length > 0)).toBe(true);
  });
});
