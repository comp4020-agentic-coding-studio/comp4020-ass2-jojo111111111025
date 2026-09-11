// Pure, DOM-free logic for the Week 11 "Break the Loop" experiment. A
// component wires this to the page; nothing here touches the DOM (see
// spec/breaking-the-loop.test.ts).
//
// Deliberately not another single-round pick task: this is a sequence
// simulation. One "lap" of the viewing loop is a fixed five-stage sequence
// (cue -> episode -> autoplay -> reward -> recommendation) that would repeat
// forever in a real system. The demo caps it at a small, illustrative
// number of laps and lets the visitor choose the one thing that varies:
// *where* the same intervention (declining autoplay) gets placed. The point
// is that placement changes the outcome even though the intervention itself
// never changes — not that the visitor who "let it run" has a self-control
// problem.

export type StageId = "cue" | "episode" | "autoplay" | "reward" | "recommendation";

export interface StageDef {
  id: StageId;
  label: string;
  description: string;
}

/** One lap of the loop. Fixed order, fixed copy — illustrative, not a model of any real product. */
export const STAGES: readonly StageDef[] = [
  { id: "cue", label: "Cue", description: "A short teaser points at what's coming next." },
  { id: "episode", label: "Episode", description: "The episode plays through to its ending." },
  {
    id: "autoplay",
    label: "Autoplay",
    description: "A countdown to the next episode starts without being asked.",
  },
  {
    id: "reward",
    label: "Reward",
    description: "The ending pays off — mostly, with one thread left open.",
  },
  {
    id: "recommendation",
    label: "Recommendation",
    description: "The next cue appears, already primed by that open thread.",
  },
] as const;

/** Illustrative cap so the demo ends; the mechanism it stands for has no such ceiling. */
export const MAX_LAPS = 4;

export type InterventionPoint = "none" | "early" | "late";

export const INTERVENTION_POINTS: readonly InterventionPoint[] = ["none", "early", "late"] as const;

/**
 * Fixed, illustrative lap+stage each real intervention breaks the loop at.
 * Both interventions are the *same action* (declining autoplay) — only its
 * position in the cycle differs, which is the whole point of the comparison.
 */
const INTERVENTION_TARGET: Record<Exclude<InterventionPoint, "none">, { lap: number; stageId: StageId }> = {
  early: { lap: 1, stageId: "autoplay" },
  late: { lap: 3, stageId: "autoplay" },
};

export interface SequenceStep {
  lap: number;
  stageId: StageId;
  label: string;
  description: string;
  /** true on the exact step where the chosen intervention fired. */
  intervened: boolean;
}

export interface RunResult {
  interventionPoint: InterventionPoint;
  steps: readonly SequenceStep[];
  episodesWatched: number;
  stoppedEarly: boolean;
}

/** Deterministically plays out the loop for one intervention choice. Never touches any prior result. */
export function runLoop(interventionPoint: InterventionPoint): RunResult {
  const target = interventionPoint === "none" ? null : INTERVENTION_TARGET[interventionPoint];
  const steps: SequenceStep[] = [];
  let stoppedEarly = false;

  lapLoop: for (let lap = 1; lap <= MAX_LAPS; lap++) {
    for (const stage of STAGES) {
      const isTarget = target !== null && target.lap === lap && target.stageId === stage.id;
      steps.push({
        lap,
        stageId: stage.id,
        label: stage.label,
        description: stage.description,
        intervened: isTarget,
      });
      if (isTarget) {
        stoppedEarly = true;
        break lapLoop;
      }
    }
  }

  return {
    interventionPoint,
    steps,
    episodesWatched: steps.filter((step) => step.stageId === "episode").length,
    stoppedEarly,
  };
}

export interface ExperimentState {
  tried: readonly InterventionPoint[];
}

export function createInitialState(): ExperimentState {
  return { tried: [] };
}

/** Runs and records one intervention point. A no-op if that point has already been tried. */
export function recordTry(state: ExperimentState, point: InterventionPoint): ExperimentState {
  if (state.tried.includes(point)) return state;
  return { tried: [...state.tried, point] };
}

export function isComplete(state: ExperimentState): boolean {
  return INTERVENTION_POINTS.every((point) => state.tried.includes(point));
}

export function remainingPoints(state: ExperimentState): InterventionPoint[] {
  return INTERVENTION_POINTS.filter((point) => !state.tried.includes(point));
}

export interface Comparison {
  none: RunResult;
  early: RunResult;
  late: RunResult;
}

/** Runs all three intervention points fresh, for the final side-by-side comparison. */
export function compareAll(): Comparison {
  return { none: runLoop("none"), early: runLoop("early"), late: runLoop("late") };
}
