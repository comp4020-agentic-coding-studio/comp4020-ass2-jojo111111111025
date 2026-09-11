// Pure, DOM-free logic for the Week 7 "How Many Did You Actually Watch?"
// experiment. A component wires this to the page; nothing here touches the
// DOM (see spec/session-builder.test.ts).
//
// Deliberately not Week 1's three-fixed-round friction/anticipation choice:
// this is an open-ended accumulation task. The visitor decides, one episode
// at a time, whether to keep going — the running total is never shown while
// they're deciding, only at the end, on request. The point isn't to
// manipulate any single decision; it's to let the running total itself go
// unnoticed the way it does during a real binge, and only make it visible
// once the session is already over.

export interface EpisodeCue {
  /** Fixed teaser copy shown before deciding whether to watch this episode. Illustrative, not adaptive. */
  teaser: string;
}

/** Escalating cue copy — each line assumes slightly more momentum than the last. A fixed script, not a live model of the visitor. */
export const EPISODE_CUES: readonly EpisodeCue[] = [
  { teaser: "Episode 1 is ready. New show, no commitment yet." },
  { teaser: "Episode 2 picks up right where that left off." },
  { teaser: "Episode 3 — you're past the slow part now." },
  { teaser: "Episode 4. You've come this far already." },
  { teaser: "Episode 5 opens on the scene everyone talks about." },
  { teaser: "Episode 6. It's later than when you started, but you're mid-arc." },
  { teaser: "Episode 7 — the season's build-up is about to pay off." },
  { teaser: "Episode 8. Stopping now means stopping right before the finale run." },
] as const;

export const MAX_EPISODES: number = EPISODE_CUES.length;

export interface SessionState {
  episodesWatched: number;
  stopped: boolean;
}

export function createInitialState(): SessionState {
  return { episodesWatched: 0, stopped: false };
}

export function isComplete(state: SessionState): boolean {
  return state.stopped || state.episodesWatched >= MAX_EPISODES;
}

export function currentCue(state: SessionState): EpisodeCue | null {
  if (isComplete(state)) return null;
  return EPISODE_CUES[state.episodesWatched] ?? null;
}

/** Watches the next episode. A no-op once the session is already complete. */
export function watchOne(state: SessionState): SessionState {
  if (isComplete(state)) return state;
  return { ...state, episodesWatched: state.episodesWatched + 1 };
}

/** Ends the session by choice, before hitting the episode cap. A no-op once already complete. */
export function stopSession(state: SessionState): SessionState {
  if (isComplete(state)) return state;
  return { ...state, stopped: true };
}

export interface SessionSummary {
  episodesWatched: number;
  reachedCap: boolean;
  /** Illustrative comparison label only — not a measured population statistic. */
  note: string;
}

function noteFor(episodesWatched: number): string {
  if (episodesWatched <= 1) {
    return "You stopped at or before the first episode — no momentum had a chance to build yet.";
  }
  if (episodesWatched <= 3) {
    return "A handful of episodes — enough for the escalating cues to start, not enough to lose track for long.";
  }
  if (episodesWatched < MAX_EPISODES) {
    return "Several episodes in — this is the range where a running total, if you'd been shown one, tends to surprise people the most.";
  }
  return "You reached this demo's built-in cap — a real session has no such ceiling.";
}

export function summarize(state: SessionState): SessionSummary {
  return {
    episodesWatched: state.episodesWatched,
    reachedCap: state.episodesWatched >= MAX_EPISODES,
    note: noteFor(state.episodesWatched),
  };
}
