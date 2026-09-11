// Pure, DOM-free logic for the Week 12 "The Streaming Loop" synthesis
// experiment. A component wires this to the page; nothing here touches the
// DOM (see spec/final-episode.test.ts).
//
// Deliberately not a new mechanism and not a definitions quiz: every moment
// below is a fixed, illustrative scene built from a mechanism this course
// already named in an earlier week (Weeks 3-5 and 7-10). The visitor
// identifies which mechanism each moment is using; the fixed "correct"
// answer key and the connective synthesis text exist so the reveal can show
// how the six mechanisms chain into each other across one viewing session,
// not just whether any single guess was right.

export type MechanismId =
  | "cliffhanger"
  | "autoplay"
  | "reward"
  | "recommendation"
  | "social"
  | "sleep-cost";

export interface MechanismDef {
  id: MechanismId;
  label: string;
  description: string;
}

export const MECHANISMS: readonly MechanismDef[] = [
  {
    id: "cliffhanger",
    label: "Cliffhanger",
    description: "An ending that leaves a specific detail unresolved (Week 3).",
  },
  {
    id: "autoplay",
    label: "Autoplay",
    description: "A countdown to the next episode that starts before anyone decides anything (Week 4).",
  },
  {
    id: "reward",
    label: "Intermittent reward",
    description: "A payoff that doesn't land every time, which is what keeps checking again compelling (Week 5).",
  },
  {
    id: "recommendation",
    label: "Recommendation narrowing",
    description: "A feed that narrows toward more of whatever you already picked (Week 8).",
  },
  {
    id: "social",
    label: "Social signal",
    description: "A cue about what other people are watching, attached to an otherwise identical option (Week 9).",
  },
  {
    id: "sleep-cost",
    label: "Sleep cost",
    description: "A real cost that's easy to discount because it's a forecast, not something happening right now (Week 10).",
  },
] as const;

export interface SessionMoment {
  id: string;
  sceneText: string;
  /** Fixed, illustrative answer key — this page's own labelling, not a scored diagnostic. */
  mechanismId: MechanismId;
}

export const MOMENTS: readonly SessionMoment[] = [
  {
    id: "moment-1",
    sceneText:
      "The episode ends mid-conversation, one sentence before whoever's at the door gets named.",
    mechanismId: "cliffhanger",
  },
  {
    id: "moment-2",
    sceneText: "Before you've clicked anything, a ten-second countdown to the next episode is already running.",
    mechanismId: "autoplay",
  },
  {
    id: "moment-3",
    sceneText:
      "Three checks in a row turn up nothing new, then the fourth turns up exactly the scene you were hoping for.",
    mechanismId: "reward",
  },
  {
    id: "moment-4",
    sceneText:
      "The next few tiles all look suspiciously like the last thing you watched, and less like anything else on the service.",
    mechanismId: "recommendation",
  },
  {
    id: "moment-5",
    sceneText: "A small label says twelve thousand people are watching this exact episode right now.",
    mechanismId: "social",
  },
  {
    id: "moment-6",
    sceneText: "It's well past a wake-up time you set for yourself, and the next episode is already queued.",
    mechanismId: "sleep-cost",
  },
] as const;

export interface MomentResponse {
  momentId: string;
  selectedMechanismId: MechanismId;
  correct: boolean;
}

export interface SessionState {
  momentIndex: number;
  responses: readonly MomentResponse[];
}

export function createInitialState(): SessionState {
  return { momentIndex: 0, responses: [] };
}

export function currentMoment(state: SessionState): SessionMoment | null {
  return MOMENTS[state.momentIndex] ?? null;
}

export function isComplete(state: SessionState): boolean {
  return state.momentIndex >= MOMENTS.length;
}

/**
 * Records the visitor's identification for the current moment and advances.
 * A no-op once the session is complete, and a no-op for any id that isn't a
 * real mechanism — both are handled safely rather than throwing.
 */
export function selectMechanism(state: SessionState, mechanismId: MechanismId): SessionState {
  if (isComplete(state)) return state;
  const moment = currentMoment(state);
  if (!moment) return state;
  if (!MECHANISMS.some((mechanism) => mechanism.id === mechanismId)) return state;

  return {
    momentIndex: state.momentIndex + 1,
    responses: [
      ...state.responses,
      { momentId: moment.id, selectedMechanismId: mechanismId, correct: mechanismId === moment.mechanismId },
    ],
  };
}

/** Fixed connective sentence per mechanism, used to narrate how each hands off to the next. Illustrative, not a causal model. */
const CONNECTIVE: Record<MechanismId, string> = {
  cliffhanger: "opens a question the mind treats as unfinished business",
  autoplay: "answers that unfinished business before a decision has a chance to happen",
  reward: "pays off unpredictably enough that the next check still feels worth making",
  recommendation: "narrows what's offered next toward more of whatever just worked",
  social: "adds a reason to pick the next thing that has nothing to do with the thing itself",
  "sleep-cost": "is the real cost the other five were quietly borrowing against the whole time",
};

export interface ChainLink {
  momentId: string;
  sceneText: string;
  mechanismLabel: string;
  connective: string;
}

export interface SessionSummary {
  correctCount: number;
  totalMoments: number;
  chain: readonly ChainLink[];
}

/** Deterministic synthesis: the fixed reinforcement chain across all six moments, plus how many the visitor identified correctly. */
export function synthesize(state: SessionState): SessionSummary {
  const chain: ChainLink[] = MOMENTS.map((moment) => ({
    momentId: moment.id,
    sceneText: moment.sceneText,
    mechanismLabel: MECHANISMS.find((mechanism) => mechanism.id === moment.mechanismId)!.label,
    connective: CONNECTIVE[moment.mechanismId],
  }));

  return {
    correctCount: state.responses.filter((response) => response.correct).length,
    totalMoments: MOMENTS.length,
    chain,
  };
}
