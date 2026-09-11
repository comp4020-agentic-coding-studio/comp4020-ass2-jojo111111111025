// Pure, DOM-free logic for the Week 8 "The Narrowing Feed" experiment. A
// component wires this to the page; nothing here touches the DOM (see
// spec/narrowing-feed.test.ts).
//
// Deliberately not Week 2's pick-one-of-three-with-a-cue task: this
// simulates a recommendation feed narrowing over several rounds in response
// to the visitor's own picks, using a fixed, deterministic weighting rule —
// never a live trained model or a random draw — labelled throughout as an
// illustrative simplification, not a real recommender.

export type Category = "comedy" | "drama" | "documentary" | "thriller";

export const CATEGORIES: readonly Category[] = ["comedy", "drama", "documentary", "thriller"] as const;

export const TILES_PER_ROUND = 4;
export const TOTAL_ROUNDS = 5;

const CATEGORY_LABEL: Record<Category, string> = {
  comedy: "Comedy",
  drama: "Drama",
  documentary: "Documentary",
  thriller: "Thriller",
};

export interface Tile {
  id: string;
  category: Category;
  title: string;
}

/** One fixed placeholder title per category, reused each time that category appears. Illustrative, not a real catalogue. */
const CATEGORY_TITLE: Record<Category, string> = {
  comedy: "The Office Party",
  drama: "Quiet Streets",
  documentary: "Inside the System",
  thriller: "Last Known Location",
};

export type Weights = Readonly<Record<Category, number>>;

function initialWeights(): Weights {
  return { comedy: 1, drama: 1, documentary: 1, thriller: 1 };
}

/**
 * Deterministic largest-remainder allocation of `slots` tiles across
 * categories in proportion to their weight. Ties break by CATEGORIES order.
 * A fixed teaching rule, not a real recommender algorithm.
 */
function allocateSlots(weights: Weights, slots: number): Category[] {
  const totalWeight = CATEGORIES.reduce((sum, c) => sum + weights[c], 0);
  const rawShares = CATEGORIES.map((c) => ({ category: c, raw: (weights[c] / totalWeight) * slots }));
  const floors = rawShares.map((s) => ({ ...s, floor: Math.floor(s.raw), remainder: s.raw - Math.floor(s.raw) }));

  let assigned = floors.reduce((sum, s) => sum + s.floor, 0);
  const counts: Record<Category, number> = { comedy: 0, drama: 0, documentary: 0, thriller: 0 };
  for (const f of floors) counts[f.category] = f.floor;

  const byRemainderDesc = [...floors].sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (assigned < slots) {
    const target = byRemainderDesc[i % byRemainderDesc.length]!.category;
    counts[target] += 1;
    assigned += 1;
    i += 1;
  }

  const result: Category[] = [];
  for (const category of CATEGORIES) {
    for (let n = 0; n < counts[category]; n++) result.push(category);
  }
  return result;
}

export interface RoundView {
  roundNumber: number;
  tiles: readonly Tile[];
  /** Count of distinct categories present in this round's tiles. */
  diversity: number;
}

export interface FeedState {
  roundIndex: number;
  weights: Weights;
  picks: readonly Category[];
}

function tilesFor(weights: Weights, roundIndex: number): Tile[] {
  const categories = allocateSlots(weights, TILES_PER_ROUND);
  return categories.map((category, index) => ({
    id: `r${roundIndex}-t${index}`,
    category,
    title: CATEGORY_TITLE[category],
  }));
}

export function createInitialState(): FeedState {
  return { roundIndex: 0, weights: initialWeights(), picks: [] };
}

export function isComplete(state: FeedState): boolean {
  return state.roundIndex >= TOTAL_ROUNDS;
}

export function currentRound(state: FeedState): RoundView | null {
  if (isComplete(state)) return null;
  const tiles = tilesFor(state.weights, state.roundIndex);
  return {
    roundNumber: state.roundIndex + 1,
    tiles,
    diversity: new Set(tiles.map((t) => t.category)).size,
  };
}

const WEIGHT_BOOST = 2;

/** Records a pick for the current round and reweights the feed for the next one. A no-op once complete. */
export function recordPick(state: FeedState, category: Category): FeedState {
  if (isComplete(state)) return state;
  return {
    roundIndex: state.roundIndex + 1,
    weights: { ...state.weights, [category]: state.weights[category] + WEIGHT_BOOST },
    picks: [...state.picks, category],
  };
}

export interface FeedSummary {
  picks: readonly { roundNumber: number; category: Category; label: string }[];
  startingDiversity: number;
  endingDiversity: number;
}

export function summarize(state: FeedState): FeedSummary {
  const startingDiversity = new Set(tilesFor(initialWeights(), 0).map((t) => t.category)).size;
  const lastRoundTiles = tilesFor(state.weights, TOTAL_ROUNDS - 1);
  const endingDiversity = new Set(lastRoundTiles.map((t) => t.category)).size;

  return {
    picks: state.picks.map((category, index) => ({
      roundNumber: index + 1,
      category,
      label: CATEGORY_LABEL[category],
    })),
    startingDiversity,
    endingDiversity,
  };
}

export function categoryLabel(category: Category): string {
  return CATEGORY_LABEL[category];
}
