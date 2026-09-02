# Your harness

This file is yours, and it arrives with no rules in it on purpose --- this note
is all there is, and it goes when you write your own. The rules you hold the
agent to are part of what gets marked, so they should be rules you decided on.

Nothing about the starter is recorded here. The platform under you is fixed and
documented in `README.md`, and the
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec. Read both before you plan or build;
what the agent needs to carry from either is your call.

## Assignment 2 project: The Psychology of "One More Episode"

Core question: **why do we keep watching when we know we should stop?**

Design thesis, and the one idea this whole site carries: **the course website
behaves like the very system it teaches students to critique.** Every content,
navigation, and visual decision should be checked against that sentence before
it ships. If a decision doesn't serve it, it's out of scope.

### Lesson from Assignment 1 — do not repeat it

Tutor feedback on A1: the mechanic worked, but the written and visual content
around it was weak — decorative rather than doing real work. For A2: **content
quality is a first-class design problem.** An interaction earns its place only
if it teaches that week's specific psychological mechanic. If it's impressive
but doesn't teach, cut it.

### The 12 weeks (fixed — don't renumber or resequence)

1. The One More Episode Effect
2. Why We Start Watching
3. Cliffhangers
4. Autoplay
5. Rewards & Reinforcement
6. Time Perception
7. Binge Watching
8. Recommendation Algorithms
9. Social Watching
10. Sleep vs Entertainment
11. Breaking the Loop
12. The Final Episode

### Every week's page needs all six of

1. a clear psychological question
2. a concise explanation
3. a concrete example
4. a meaningful interaction/experiment (where one genuinely helps — never for
   decoration)
5. a reflection/question back to the visitor
6. a connection to the previous and next week ("Previously on…" / "Next
   episode…")

### Platform contract vs. what's ours (see `README.md`)

Fixed, don't touch: the Slop identity, the four collection **keys**
(`sessions`, `assessments`, `lectures`, `people`), the build pipeline, the
generated API. Everything else is ours, including how those fixed keys are
*labelled*. `src/site-config.ts` already has the sanctioned pattern —
`sessionLabels` renames "Session" in the UI while the collection stays
`sessions`. Do the same for `lectures` → "Episode" rather than trying to
rename the collection itself.

Extra frontmatter fields (e.g. `previouslyOn`, `nextTease`,
`psychologicalQuestion`) pass straight into the generated API's `meta` object
already — `course-content.ts` puts anything outside the base
`courseNodeSchema` fields there, no `content.config.ts` change required to use
them. Formalise the ones we rely on everywhere in `content.config.ts` once the
content model is settled, for real validation instead of silent typos.

### Streaming vocabulary — use, don't copy

Use: Episode, Continue Watching, Up Next, Previously On, Watch Progress,
autoplay-style countdowns, recommendation-style navigation. Don't copy
Netflix's actual branding, palette, or logo treatment — the site needs its own
academic identity underneath the streaming behaviour.

### Build order — do not jump to building all 12 weeks

Prototype one week's page fully (content + interaction + layout) before
templating the rest. Test that one page works before Phase 5/6 (templating,
then full build). A full-site generation pass in one shot is the thing to
avoid — it's how A1's content ended up thin.
