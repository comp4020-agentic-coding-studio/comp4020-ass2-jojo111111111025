import { describe, expect, it } from "vitest";
import {
  BLOCKS,
  createInitialState,
  currentBlock,
  isBlockComplete,
  isComplete,
  recordCheck,
  summarize,
} from "../src/scripts/reward-schedule";

// Unit tests for the Week 5 interaction's own logic (src/scripts/reward-schedule.ts).
// Distinct from the deliverable-derived tests elsewhere in this directory: this one
// checks a mechanic this repo built, not a line from the published spec.

describe("reward-schedule experiment", () => {
  it("starts on the first block with no responses", () => {
    const state = createInitialState();
    expect(state.responses).toEqual([]);
    expect(currentBlock(state)?.id).toBe("block-1");
    expect(isBlockComplete(state)).toBe(false);
    expect(isComplete(state)).toBe(false);
  });

  it("recordCheck advances immutably and reports the pattern's next entry", () => {
    const state0 = createInitialState();
    const state1 = recordCheck(state0);
    expect(state0.responses).toEqual([]); // unchanged
    expect(state1.responses).toHaveLength(1);
    expect(state1.responses[0]?.rewarded).toBe(false); // block-1[0] is false
    expect(state1.responses[0]?.schedule).toBe("fixed");
  });

  it("moves to the second block once the first block's pattern is exhausted", () => {
    let state = createInitialState();
    const block1Length = BLOCKS[0]!.pattern.length;
    for (let i = 0; i < block1Length; i++) state = recordCheck(state);
    expect(currentBlock(state)?.id).toBe("block-2");
    expect(state.responses).toHaveLength(block1Length);
  });

  it("is complete only after both blocks are exhausted", () => {
    let state = createInitialState();
    const total = BLOCKS.reduce((sum, b) => sum + b.pattern.length, 0);
    for (let i = 0; i < total; i++) {
      expect(isComplete(state)).toBe(false);
      state = recordCheck(state);
    }
    expect(isComplete(state)).toBe(true);
    expect(currentBlock(state)).toBeNull();
  });

  it("does nothing once already complete", () => {
    let state = createInitialState();
    const total = BLOCKS.reduce((sum, b) => sum + b.pattern.length, 0);
    for (let i = 0; i < total; i++) state = recordCheck(state);
    const finished = state;
    expect(recordCheck(finished)).toEqual(finished);
  });

  it("has exactly one fixed and one variable block with the same total reward count", () => {
    const schedules = BLOCKS.map((b) => b.schedule).sort();
    expect(schedules).toEqual(["fixed", "variable"]);

    const totalRewards = BLOCKS.map((b) => b.pattern.filter(Boolean).length);
    expect(totalRewards[0]).toBe(totalRewards[1]); // identical total reward count by design
  });

  it("computes the longest no-reward gap correctly per block", () => {
    let state = createInitialState();
    const total = BLOCKS.reduce((sum, b) => sum + b.pattern.length, 0);
    for (let i = 0; i < total; i++) state = recordCheck(state);

    const summary = summarize(state);
    const block1 = summary.find((s) => s.blockId === "block-1")!;
    const block2 = summary.find((s) => s.blockId === "block-2")!;
    expect(block1.totalChecks).toBe(BLOCKS[0]!.pattern.length);
    expect(block1.totalRewards).toBe(2);
    expect(block1.longestGap).toBe(2); // false, false, true, false, false, true
    expect(block2.longestGap).toBe(3); // false, true, false, false, false, true
  });

  it("summarize reports zeroed stats for a block with no responses yet", () => {
    const state = createInitialState();
    const summary = summarize(state);
    expect(summary).toHaveLength(2);
    expect(summary[1]?.totalChecks).toBe(0);
    expect(summary[1]?.longestGap).toBe(0);
  });
});
