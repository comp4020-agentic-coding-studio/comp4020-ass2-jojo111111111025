import { describe, expect, it } from "vitest";
import {
  EPISODE_CUES,
  MAX_EPISODES,
  createInitialState,
  currentCue,
  isComplete,
  stopSession,
  summarize,
  watchOne,
} from "../src/scripts/session-builder";

// Unit tests for the Week 7 interaction's own logic (src/scripts/session-builder.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("session-builder experiment", () => {
  it("starts at zero episodes, not stopped, with the first cue available", () => {
    const state = createInitialState();
    expect(state.episodesWatched).toBe(0);
    expect(isComplete(state)).toBe(false);
    expect(currentCue(state)).toEqual(EPISODE_CUES[0]);
  });

  it("watchOne increments the count immutably", () => {
    const state0 = createInitialState();
    const state1 = watchOne(state0);
    expect(state0.episodesWatched).toBe(0); // unchanged
    expect(state1.episodesWatched).toBe(1);
    expect(currentCue(state1)).toEqual(EPISODE_CUES[1]);
  });

  it("stopSession marks the session complete without changing the count", () => {
    let state = createInitialState();
    state = watchOne(state);
    state = watchOne(state);
    state = stopSession(state);
    expect(isComplete(state)).toBe(true);
    expect(state.episodesWatched).toBe(2);
  });

  it("watchOne is a no-op once stopped", () => {
    let state = createInitialState();
    state = stopSession(state);
    expect(watchOne(state)).toEqual(state);
  });

  it("becomes complete automatically at the episode cap, without an explicit stop", () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_EPISODES; i++) {
      expect(isComplete(state)).toBe(false);
      state = watchOne(state);
    }
    expect(isComplete(state)).toBe(true);
    expect(state.episodesWatched).toBe(MAX_EPISODES);
    expect(currentCue(state)).toBeNull();
  });

  it("watchOne is a no-op once the cap is reached", () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_EPISODES; i++) state = watchOne(state);
    const atCap = state;
    expect(watchOne(atCap)).toEqual(atCap);
  });

  it("stopSession is a no-op once already complete", () => {
    let state = createInitialState();
    state = stopSession(state);
    const stopped = state;
    expect(stopSession(stopped)).toEqual(stopped);
  });

  it("has a distinct, non-empty teaser for every episode cue", () => {
    const teasers = new Set(EPISODE_CUES.map((cue) => cue.teaser));
    expect(teasers.size).toBe(EPISODE_CUES.length);
    expect(EPISODE_CUES.every((cue) => cue.teaser.length > 0)).toBe(true);
  });

  it("summarize reports the count, whether the cap was reached, and a non-empty note", () => {
    let state = createInitialState();
    state = watchOne(state);
    state = stopSession(state);
    const summary = summarize(state);
    expect(summary.episodesWatched).toBe(1);
    expect(summary.reachedCap).toBe(false);
    expect(summary.note.length).toBeGreaterThan(0);
  });

  it("summarize flags reachedCap once the visitor hits the episode ceiling", () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_EPISODES; i++) state = watchOne(state);
    expect(summarize(state).reachedCap).toBe(true);
  });
});
