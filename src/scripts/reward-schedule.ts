// Pure, DOM-free logic for the Week 5 "Payout Schedule" experiment. A
// component wires this to the page; nothing here touches the DOM (see
// spec/reward-schedule.test.ts).
//
// Deliberately not a live random draw: each block's reward pattern is a
// fixed, precomputed sequence, labelled as an illustrative teaching pattern
// rather than a real probability measurement. Both blocks award the same
// total number of rewards, so the only thing that differs between them is
// *when* the rewards land — a fixed rhythm vs. an irregular one — which is
// the actual mechanism this week teaches, not "one schedule pays out more."

export type Schedule = "fixed" | "variable";

export interface BlockConfig {
  id: string;
  schedule: Schedule;
  /** One entry per check in the block: true = reward. A fixed teaching pattern, not a live draw. */
  pattern: readonly boolean[];
}

export const BLOCKS: readonly BlockConfig[] = [
  {
    id: "block-1",
    schedule: "fixed",
    // Reward every third check — perfectly regular.
    pattern: [false, false, true, false, false, true],
  },
  {
    id: "block-2",
    schedule: "variable",
    // Same total reward count (2) as block-1, irregular spacing.
    pattern: [false, true, false, false, false, true],
  },
] as const;

export interface CheckResult {
  blockId: string;
  schedule: Schedule;
  checkNumber: number;
  rewarded: boolean;
}

export interface ExperimentState {
  blockIndex: number;
  checkIndex: number;
  responses: readonly CheckResult[];
}

export function createInitialState(): ExperimentState {
  return { blockIndex: 0, checkIndex: 0, responses: [] };
}

export function currentBlock(state: ExperimentState): BlockConfig | null {
  return BLOCKS[state.blockIndex] ?? null;
}

export function isBlockComplete(state: ExperimentState): boolean {
  const block = currentBlock(state);
  return block === null || state.checkIndex >= block.pattern.length;
}

export function isComplete(state: ExperimentState): boolean {
  return state.blockIndex >= BLOCKS.length;
}

/** Performs the next check in the current block. A no-op once every block is complete. */
export function recordCheck(state: ExperimentState): ExperimentState {
  const block = currentBlock(state);
  if (!block || state.checkIndex >= block.pattern.length) return state;

  const rewarded = block.pattern[state.checkIndex]!;
  const response: CheckResult = {
    blockId: block.id,
    schedule: block.schedule,
    checkNumber: state.checkIndex + 1,
    rewarded,
  };

  const nextCheckIndex = state.checkIndex + 1;
  const blockFinished = nextCheckIndex >= block.pattern.length;

  return {
    blockIndex: blockFinished ? state.blockIndex + 1 : state.blockIndex,
    checkIndex: blockFinished ? 0 : nextCheckIndex,
    responses: [...state.responses, response],
  };
}

export interface BlockSummary {
  blockId: string;
  schedule: Schedule;
  totalChecks: number;
  totalRewards: number;
  /** The longest run of consecutive checks with no reward, in this block. */
  longestGap: number;
}

function longestGapFor(responses: readonly CheckResult[]): number {
  let longest = 0;
  let current = 0;
  for (const response of responses) {
    if (response.rewarded) {
      current = 0;
    } else {
      current += 1;
      longest = Math.max(longest, current);
    }
  }
  return longest;
}

export function summarize(state: ExperimentState): BlockSummary[] {
  return BLOCKS.map((block) => {
    const responses = state.responses.filter((r) => r.blockId === block.id);
    return {
      blockId: block.id,
      schedule: block.schedule,
      totalChecks: responses.length,
      totalRewards: responses.filter((r) => r.rewarded).length,
      longestGap: longestGapFor(responses),
    };
  });
}
