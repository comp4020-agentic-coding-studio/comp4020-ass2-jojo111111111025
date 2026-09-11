import { describe, expect, it } from "vitest";
import {
  MECHANISMS,
  MOMENTS,
  createInitialState,
  currentMoment,
  isComplete,
  selectMechanism,
  synthesize,
} from "../src/scripts/final-episode";

// Unit tests for the Week 12 interaction's own logic (src/scripts/final-episode.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("final-episode experiment", () => {
  it("starts at the first moment with no responses, and is not complete", () => {
    const state = createInitialState();
    expect(state.momentIndex).toBe(0);
    expect(state.responses).toEqual([]);
    expect(isComplete(state)).toBe(false);
    expect(currentMoment(state)).toEqual(MOMENTS[0]);
  });

  it("names exactly the six mechanisms this course covered, each with a Week reference", () => {
    expect(MECHANISMS).toHaveLength(6);
    expect(MECHANISMS.map((m) => m.id)).toEqual([
      "cliffhanger",
      "autoplay",
      "reward",
      "recommendation",
      "social",
      "sleep-cost",
    ]);
    for (const mechanism of MECHANISMS) {
      expect(mechanism.description).toMatch(/Week \d+/);
    }
  });

  it("a correct selection advances the moment and is recorded as correct", () => {
    const state0 = createInitialState();
    const moment0 = currentMoment(state0)!;
    const state1 = selectMechanism(state0, moment0.mechanismId);

    expect(state0.momentIndex).toBe(0); // unchanged
    expect(state1.momentIndex).toBe(1);
    expect(state1.responses).toHaveLength(1);
    expect(state1.responses[0]).toMatchObject({
      momentId: moment0.id,
      selectedMechanismId: moment0.mechanismId,
      correct: true,
    });
  });

  it("an incorrect selection still advances the moment, recorded as incorrect", () => {
    const state0 = createInitialState();
    const moment0 = currentMoment(state0)!;
    const wrongId = MECHANISMS.find((m) => m.id !== moment0.mechanismId)!.id;
    const state1 = selectMechanism(state0, wrongId);

    expect(state1.momentIndex).toBe(1);
    expect(state1.responses[0]).toMatchObject({ selectedMechanismId: wrongId, correct: false });
  });

  it("an invalid mechanism id is a safe no-op", () => {
    const state0 = createInitialState();
    // @ts-expect-error deliberately invalid for the no-op safety check
    const state1 = selectMechanism(state0, "not-a-real-mechanism");
    expect(state1).toEqual(state0);
  });

  it("walking through all six moments reaches completion", () => {
    let state = createInitialState();
    for (let i = 0; i < MOMENTS.length; i++) {
      expect(isComplete(state)).toBe(false);
      const moment = currentMoment(state)!;
      state = selectMechanism(state, moment.mechanismId);
    }
    expect(isComplete(state)).toBe(true);
    expect(currentMoment(state)).toBeNull();
    expect(state.responses).toHaveLength(MOMENTS.length);
  });

  it("selectMechanism is a no-op once the session is complete", () => {
    let state = createInitialState();
    for (const moment of MOMENTS) {
      state = selectMechanism(state, moment.mechanismId);
    }
    const completed = state;
    expect(selectMechanism(completed, "cliffhanger")).toEqual(completed);
  });

  it("synthesize reports the full fixed chain and a correct-count matching responses", () => {
    let state = createInitialState();
    // Answer the first three correctly, the rest incorrectly.
    for (let i = 0; i < MOMENTS.length; i++) {
      const moment = currentMoment(state)!;
      const id = i < 3 ? moment.mechanismId : MECHANISMS.find((m) => m.id !== moment.mechanismId)!.id;
      state = selectMechanism(state, id);
    }

    const summary = synthesize(state);
    expect(summary.totalMoments).toBe(MOMENTS.length);
    expect(summary.correctCount).toBe(3);
    expect(summary.chain).toHaveLength(MOMENTS.length);
    summary.chain.forEach((link, index) => {
      expect(link.momentId).toBe(MOMENTS[index]!.id);
      expect(link.mechanismLabel.length).toBeGreaterThan(0);
      expect(link.connective.length).toBeGreaterThan(0);
    });
  });

  it("synthesize's chain is identical regardless of how the visitor answered", () => {
    const untouched = synthesize(createInitialState());
    let allWrongState = createInitialState();
    for (const moment of MOMENTS) {
      const wrongId = MECHANISMS.find((m) => m.id !== moment.mechanismId)!.id;
      allWrongState = selectMechanism(allWrongState, wrongId);
    }
    const allWrong = synthesize(allWrongState);
    expect(allWrong.chain).toEqual(untouched.chain);
    expect(allWrong.correctCount).toBe(0);
  });
});
