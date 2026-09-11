import { describe, expect, it } from "vitest";
import {
  ROUNDS,
  SHOWS,
  createInitialState,
  cueTextFor,
  cuedPickCount,
  cuedRoundCount,
  currentRound,
  isComplete,
  recordPick,
  summarize,
} from "../src/scripts/social-signal";

// Unit tests for the Week 9 interaction's own logic (src/scripts/social-signal.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("social-signal experiment", () => {
  it("starts on the first (baseline, no-cue) round", () => {
    const state = createInitialState();
    expect(currentRound(state)?.cueType).toBe("none");
    expect(currentRound(state)?.cueSlot).toBeNull();
    expect(isComplete(state)).toBe(false);
  });

  it("always presents exactly two, identically-formatted shows", () => {
    expect(SHOWS).toHaveLength(2);
    expect(SHOWS[0].synopsis).toBe(SHOWS[1].synopsis);
  });

  it("records the baseline round with a null pickedCuedSlot", () => {
    const state = recordPick(createInitialState(), "left");
    expect(state.responses[0]?.pickedCuedSlot).toBeNull();
  });

  it("records a cued round as true when the visitor picks the cued slot, false otherwise", () => {
    let state = createInitialState();
    state = recordPick(state, "left"); // baseline
    const cuedRound = currentRound(state)!;
    const stateAgree = recordPick(state, cuedRound.cueSlot!);
    expect(stateAgree.responses[1]?.pickedCuedSlot).toBe(true);

    const otherSlot = cuedRound.cueSlot === "left" ? "right" : "left";
    const stateDisagree = recordPick(state, otherSlot);
    expect(stateDisagree.responses[1]?.pickedCuedSlot).toBe(false);
  });

  it("advances immutably and completes only after every round", () => {
    let state = createInitialState();
    for (let i = 0; i < ROUNDS.length; i++) {
      const before = state;
      expect(isComplete(state)).toBe(false);
      state = recordPick(state, "left");
      expect(before.responses).toHaveLength(i); // unchanged
    }
    expect(isComplete(state)).toBe(true);
    expect(currentRound(state)).toBeNull();
  });

  it("does nothing once already complete", () => {
    let state = createInitialState();
    for (let i = 0; i < ROUNDS.length; i++) state = recordPick(state, "left");
    const finished = state;
    expect(recordPick(finished, "right")).toEqual(finished);
  });

  it("alternates which slot carries the cue across cued rounds, and has both cue types", () => {
    const cuedRounds = ROUNDS.filter((r) => r.cueSlot !== null);
    expect(cuedRounds.length).toBeGreaterThan(1);
    const slots = new Set(cuedRounds.map((r) => r.cueSlot));
    expect(slots.size).toBe(2); // both left and right appear as the cued slot at least once

    const cueTypes = new Set(ROUNDS.map((r) => r.cueType));
    expect(cueTypes.has("crowd")).toBe(true);
    expect(cueTypes.has("friend")).toBe(true);
    expect(cueTypes.has("none")).toBe(true);
  });

  it("returns cue text only for non-baseline cue types", () => {
    expect(cueTextFor("none")).toBeNull();
    expect(cueTextFor("crowd")).not.toBeNull();
    expect(cueTextFor("friend")).not.toBeNull();
  });

  it("counts cued picks only among rounds that actually had a cue", () => {
    let state = createInitialState();
    for (const round of ROUNDS) {
      state = recordPick(state, round.cueSlot ?? "left");
    }
    expect(cuedRoundCount(state)).toBe(ROUNDS.filter((r) => r.cueSlot !== null).length);
    expect(cuedPickCount(state)).toBe(cuedRoundCount(state)); // picked the cued slot every time here
  });

  it("summarize returns one entry per round, numbered, with a non-empty note", () => {
    let state = createInitialState();
    for (const round of ROUNDS) state = recordPick(state, round.cueSlot ?? "right");
    const summary = summarize(state);
    expect(summary.map((s) => s.roundNumber)).toEqual([1, 2, 3, 4]);
    expect(summary.every((s) => s.note.length > 0)).toBe(true);
  });
});
