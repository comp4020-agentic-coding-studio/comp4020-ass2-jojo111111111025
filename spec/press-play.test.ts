import { describe, expect, it } from "vitest";
import {
  ROUNDS,
  createInitialState,
  cuedPickCount,
  currentRound,
  isComplete,
  recordPick,
  summarize,
} from "../src/scripts/press-play";

// Unit tests for the Week 2 interaction's own logic (src/scripts/press-play.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("press-play experiment", () => {
  it("starts with no responses and the first round current", () => {
    const state = createInitialState();
    expect(state.responses).toEqual([]);
    expect(currentRound(state)?.id).toBe("round-1");
    expect(isComplete(state)).toBe(false);
  });

  it("advances one round per pick, without mutating the previous state", () => {
    const state0 = createInitialState();
    const state1 = recordPick(state0, "a");
    expect(state0.responses).toEqual([]); // unchanged
    expect(state1.responses).toEqual([{ cue: "baseline", pickedOptionId: "a", pickedCuedOption: false }]);
    expect(currentRound(state1)?.id).toBe("round-2");
  });

  it("is complete only after a pick has been recorded for every round", () => {
    let state = createInitialState();
    for (let i = 0; i < ROUNDS.length; i++) {
      expect(isComplete(state)).toBe(false);
      state = recordPick(state, ROUNDS[i]!.options[0]!.id);
    }
    expect(isComplete(state)).toBe(true);
    expect(currentRound(state)).toBeNull();
  });

  it("does nothing once already complete", () => {
    let state = createInitialState();
    for (const round of ROUNDS) state = recordPick(state, round.options[0]!.id);
    const finished = state;
    expect(recordPick(finished, "a")).toEqual(finished);
  });

  it("has exactly one baseline round and one cued option each in the other two rounds", () => {
    const baseline = ROUNDS.filter((round) => round.cue === "baseline");
    const cued = ROUNDS.filter((round) => round.cuedOptionId !== null);
    expect(baseline).toHaveLength(1);
    expect(cued).toHaveLength(2);
    expect(cued.map((round) => round.cue).sort()).toEqual(["curiosity-gap", "social-proof"]);
    // every cued option must actually exist among that round's options
    for (const round of cued) {
      expect(round.options.some((option) => option.id === round.cuedOptionId)).toBe(true);
    }
  });

  it("puts the cued option in a different slot across the two manipulated rounds", () => {
    const cued = ROUNDS.filter((round) => round.cuedOptionId !== null);
    const slots = cued.map((round) => round.options.findIndex((option) => option.id === round.cuedOptionId));
    expect(new Set(slots).size).toBe(slots.length);
  });

  it("counts a cued pick only on the manipulated rounds, never on baseline", () => {
    let state = createInitialState();
    state = recordPick(state, "a"); // round 1, baseline — "a" isn't cued, and never counts anyway
    state = recordPick(state, "b"); // round 2, cued option is "b"
    state = recordPick(state, "c"); // round 3, cued option is "a" — this misses it
    expect(cuedPickCount(state)).toBe(1);
  });

  it("summarizes each round with its cue and a plain-language note", () => {
    let state = createInitialState();
    state = recordPick(state, "a");
    state = recordPick(state, "b");
    state = recordPick(state, "a");
    const summary = summarize(state);
    expect(summary.map((s) => s.roundNumber)).toEqual([1, 2, 3]);
    expect(summary.map((s) => s.cue)).toEqual(["baseline", "social-proof", "curiosity-gap"]);
    expect(summary.every((s) => s.note.length > 0)).toBe(true);
  });
});
