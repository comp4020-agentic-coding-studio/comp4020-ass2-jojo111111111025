// Pure, DOM-free logic for the Week 3 "Rank the Cut" experiment. A component
// wires this to the page; nothing here touches the DOM (see
// spec/cliffhanger-ranking.test.ts).
//
// Deliberately not a choice-and-reveal task like Weeks 1/2/6: this is a
// sequencing/ranking task. The visitor reorders four candidate scene-endings
// from "least" to "most" it would pull them to keep watching, using move-up/
// move-down controls rather than drag-and-drop (so it stays keyboard
// operable without extra ARIA work). `infoGapScore` is an illustrative
// teaching label for how much each ending deliberately withholds, not a
// measurement of the visitor.

export interface EndingConfig {
  id: string;
  label: string;
  sceneText: string;
  /** Illustrative 1-4 teaching label: how much this ending withholds. Not a real metric. */
  infoGapScore: number;
}

export const ENDINGS: readonly EndingConfig[] = [
  {
    id: "resolved",
    label: "Fully answered",
    sceneText: "She opens the door. It's her sister, exactly as expected. They hug.",
    infoGapScore: 1,
  },
  {
    id: "partial",
    label: "Partly answered",
    sceneText: "She opens the door. It's a courier, but he's holding something he won't explain yet.",
    infoGapScore: 2,
  },
  {
    id: "open-question",
    label: "A question is asked, not answered",
    sceneText: "She opens the door. \"How did you find this address?\" is all she manages to say.",
    infoGapScore: 3,
  },
  {
    id: "reveal-interrupted",
    label: "An answer is interrupted mid-reveal",
    sceneText: "She opens the door. \"I need to tell you who really—\" The screen cuts to black.",
    infoGapScore: 4,
  },
] as const;

/** A deliberately scrambled starting order — not id order, not the expected order. */
const INITIAL_ORDER: readonly string[] = ["partial", "reveal-interrupted", "resolved", "open-question"];

export interface RankingState {
  /** Ending ids in the visitor's current order, weakest pull first. */
  order: readonly string[];
  confirmed: boolean;
}

export function createInitialState(): RankingState {
  return { order: INITIAL_ORDER, confirmed: false };
}

function findEnding(id: string): EndingConfig {
  const ending = ENDINGS.find((e) => e.id === id);
  if (!ending) throw new Error(`unknown ending id: ${id}`);
  return ending;
}

export function moveUp(state: RankingState, index: number): RankingState {
  if (state.confirmed || index <= 0 || index >= state.order.length) return state;
  const order = [...state.order];
  [order[index - 1], order[index]] = [order[index]!, order[index - 1]!];
  return { ...state, order };
}

export function moveDown(state: RankingState, index: number): RankingState {
  if (state.confirmed || index < 0 || index >= state.order.length - 1) return state;
  const order = [...state.order];
  [order[index], order[index + 1]] = [order[index + 1]!, order[index]!];
  return { ...state, order };
}

export function confirmRanking(state: RankingState): RankingState {
  if (state.confirmed) return state;
  return { ...state, confirmed: true };
}

export function isComplete(state: RankingState): boolean {
  return state.confirmed;
}

const EXPECTED_ORDER: readonly string[] = [...ENDINGS]
  .sort((a, b) => a.infoGapScore - b.infoGapScore)
  .map((e) => e.id);

/** Count of pairs (i < j in the visitor's order) whose info-gap scores also increase or tie. */
export function concordantPairs(state: RankingState): number {
  let count = 0;
  for (let i = 0; i < state.order.length; i++) {
    for (let j = i + 1; j < state.order.length; j++) {
      const scoreI = findEnding(state.order[i]!).infoGapScore;
      const scoreJ = findEnding(state.order[j]!).infoGapScore;
      if (scoreI <= scoreJ) count++;
    }
  }
  return count;
}

export function totalPairs(state: RankingState): number {
  const n = state.order.length;
  return (n * (n - 1)) / 2;
}

export interface RankingSummaryItem {
  position: number;
  id: string;
  label: string;
  infoGapScore: number;
}

export interface RankingSummary {
  order: readonly RankingSummaryItem[];
  expectedOrder: readonly string[];
  concordantPairs: number;
  totalPairs: number;
}

/** Only meaningful once confirmed; callers should gate on isComplete. */
export function summarize(state: RankingState): RankingSummary {
  return {
    order: state.order.map((id, index) => {
      const ending = findEnding(id);
      return { position: index + 1, id, label: ending.label, infoGapScore: ending.infoGapScore };
    }),
    expectedOrder: EXPECTED_ORDER,
    concordantPairs: concordantPairs(state),
    totalPairs: totalPairs(state),
  };
}
