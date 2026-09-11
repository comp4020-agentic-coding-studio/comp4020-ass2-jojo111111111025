# Process overview

Written by you, for a reader: how you got from the brief to the harness and
agentic workflow behind this submission. Markers read this file and follow its
citations; they don't trawl the repo for evidence you didn't point at.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and its
[word counts](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#word-counts)
cover every deliverable.

## What I built

A course website for **The Psychology of "One More Episode"** — a fictional
Slop University course whose central thesis is that the site itself behaves
like the streaming systems it teaches students to critique. One week (Week 1
— The One More Episode Effect) is built, schema-formalised, and verified
end to end; the other eleven are deliberately not started yet.

## How I got here

### Phase 1 — investigation and architecture, before writing any page

Starting point: the repo arrived from the template with two placeholder
weeks, an unfilled `PROCESS.md`, a blank `CLAUDE.md`, and three spec tests
(course code, curriculum-weeks, deck presence, assessment weighting) already
written against the published Assignment 2 spec in an earlier session
([`805d06f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/805d06f)).
The `curriculum` test was deliberately red — only 2 of 12 weeks existed.

Before writing any page, I read `README.md` (what's fixed: the Slop identity,
the four collection **keys**, the build pipeline, the generated API — nothing
else) and `src/content.config.ts` / `src/site-config.ts` to find where the
platform's flexibility actually lives. Two things mattered for this course
concept specifically:

- `src/site-config.ts` already separates a collection's fixed key from its
  displayed label (`sessionLabels` renames "Session" in the UI while the URL
  and collection stay `sessions`). That's the sanctioned way to make
  `lectures` read as "Episode" without renaming the collection itself.
- the content schemas (`content.config.ts`) use Zod's `.loose()`, and the
  API generator (`course-content.ts` in `astro-course-university`) puts any
  frontmatter field outside the base `courseNodeSchema` straight into the
  generated `meta` object. So narrative fields a streaming-style page needs —
  `previouslyOn`, `nextTease`, `psychologicalQuestion` — can be added to
  lecture frontmatter immediately, and formalised into `content.config.ts`
  once the shape is proven, rather than needing schema work up front.

**Decision:** treat the fixed `lectures` collection as the "Episode" content
type (one per week, all six of question/explanation/example/interaction/
reflection/prev-next), relabelled in the UI only. `sessions` stays available
for the (optional, lighter-weight) weekly discussion/screening slot but isn't
where the curriculum load lives.

**Decision:** prototype **Week 1 — The One More Episode Effect** first, not
Week 4 (Autoplay), even though Autoplay's countdown widget is the more
obviously reusable component. Week 1 is what a marker opens first from the
homepage, has no "previously on" dependency to fake, and its natural
interaction (a live "keep watching?" countdown) is the simplest version of
the autoplay-style pattern that recurs later — building it first de-risks
that shared pattern before diversifying into weeks 4/6/9's bespoke widgets.

**Alternatives considered and rejected:**

1. *Literal Netflix-style visual clone.* Rejected — the brief explicitly
   rules out copying Netflix's actual branding, and a flashy skin over thin
   content repeats exactly the A1 tutor feedback (mechanic fine, content
   weak) rather than fixing it.
2. *An explicit "University mode / Streaming mode" toggle switch.* Rejected
   — it turns the thesis into a labelled gimmick ("look, two skins") instead
   of one integrated system, and roughly doubles the content-authoring
   surface for no content-quality gain.
3. *A persistent gamification layer (XP, streaks, badges) across the whole
   site.* Rejected — that's a real psychological mechanic, but a different
   one from binge-watching, and bolting it on everywhere dilutes "one idea
   carried all the way through." It's a legitimate candidate for Week 5's
   own contained interaction (Rewards & Reinforcement), not a site-wide
   layer.
4. *Text-only academic treatment, streaming language as flavour only.*
   Rejected as too conservative — it satisfies nothing the brief actually
   asks for (the site behaving like a streaming platform) and would read as
   the safe, unsurprising response the HD band explicitly wants to avoid.

This phase's commit contains `CLAUDE.md` (the durable version of the
decisions above, for whichever session builds next) and this `PROCESS.md`
entry — no site content yet.

### Phase 2 — formalise the episode frontmatter fields

Landed inside Phase 3's commit rather than as its own, once the page shape
below made clear which fields were actually load-bearing: the three
narrative fields Phase 1 named (`psychologicalQuestion`, `previouslyOn`,
`nextTease`) were added to the `lectures` schema in `content.config.ts` as
optional trimmed strings
([`68308d3`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/68308d3)).
Optional, because eleven of the twelve weeks don't have them yet and a
missing narrative field should be a silent gap, not a schema-breaking one.
This is the "formalise... for real validation instead of silent typos" step
CLAUDE.md called for, scoped to exactly the fields Phase 1's page-shape
decision needed — not a speculative schema pass.

### Phase 3 — prototype Week 1, then check it actually works

Built `src/content/lectures/week-01.mdx` against the six-element checklist
CLAUDE.md sets for every week's page (question / explanation / example /
interaction / reflection / prev-next), the `OneMoreEpisodeExperiment`
interaction (`src/components/OneMoreEpisodeExperiment.astro`, state machine
in `src/scripts/one-more-episode.ts`), and unit tests for that state machine
(`spec/one-more-episode.test.ts`) — all in
[`68308d3`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/68308d3).

The interaction is three rounds of the same "keep watching / stop" choice
under three different interface conditions: an unmanipulated baseline, a
3-second disabled/countdown state on "Stop for now" (friction), and an
unresolved teaser attached to "Continue Watching" (anticipation). A closing
"What just happened?" section names both mechanisms explicitly and warns
against reading a three-round, n=1 demonstration as evidence about the
visitor's own habits — the A1 lesson was that an interaction has to *teach*
the mechanic it uses, not just be impressive, so that debrief is the page's
real content, not decoration around the widget.

**Checked before calling this phase done**, in a later session:

- `pnpm check` (typecheck + build + `vitest run spec`): typecheck clean,
  build clean, all of the interaction's own unit tests pass.
  `curriculum.test.ts`'s "all twelve weeks" assertion fails, listing weeks
  3–12 — expected and unchanged from Phase 1 (that test was deliberately red
  from the start); it stays red until templating happens, one week at a
  time, per CLAUDE.md's build order.
- The build's own accessibility checker and broken-link checker passed
  across all 16 generated pages, `/lectures/week-01/` included.
- The friction/countdown and teaser behaviour is verified at the unit level
  (`spec/one-more-episode.test.ts` asserts exactly one round carries
  `stopDelaySeconds > 0` and exactly one carries a `teaserText`) and by
  reading `OneMoreEpisodeExperiment.astro`'s script, which disables "Stop
  for now" and runs a one-second countdown exactly when `stopDelaySeconds >
  0`, and reveals the teaser exactly when `teaserText` is set. A live,
  rendered click-through in an actual browser was **not** possible in that
  session's container — headless Chromium needs system shared libraries
  (`libnspr4` and friends) that can't be installed without root, which the
  sandbox didn't have — so the pixels themselves are unconfirmed. Worth a
  real dev-server click-through in a normal environment before leaning on
  this page as the template for the other eleven.

Phase 4 (`5b9f548`) decided the frontmatter shape needed no changes, but the
enforcement mechanism did: a schema-level `.superRefine` requiring
`psychologicalQuestion`/`previouslyOn`/`nextTease` was tried first and
reverted once it turned out to hard-fail `astro check`/`astro build` for
every unfinished placeholder week, not just report the gap. The fields stay
`.optional()` in `content.config.ts`; `spec/curriculum.test.ts` gained a
test that reports missing connective tissue as a normal, non-build-breaking
failure instead.

### Phase 5 — validate the pattern on a second mechanic (Week 2)

**Goal:** Phase 3 proved Week 1's page structure and interaction
architecture work for one mechanic. Phase 5 uses Week 2 — a different
psychological mechanism (why people press play at all, vs. Week 1's why
they don't stop) — to test whether that structure and architecture hold up
on a second, deliberately different interaction, before assuming they're a
template for Weeks 3–12.

**What was reused from Week 1:**

- the six-part episode structure: psychological question → explanation →
  concrete example → interaction → debrief → reflection / prev-next
  navigation
- the interaction architecture: pure, DOM-free state logic
  (`src/scripts/*.ts`) → a thin `.astro` component that only wires that
  logic to the DOM → focused unit tests
- a debrief that explicitly names the mechanism(s) the interaction just
  used and ties them back to the week's stated psychological question
- explicit n=1 / demonstration-not-evidence framing, so a three-click
  exercise is never oversold as data about the visitor

**What's new for Week 2:** a "Browse Screen" pick-one-of-three interaction —
meaningfully different from Week 1's binary continue/stop choice, not a
re-skin of it. Three rounds: an unmanipulated baseline (the visitor's
starting preference), a social-proof condition (one show carries a
"Trending #1" badge), and a curiosity-gap condition (one show's synopsis
poses an unresolved question instead of a plot summary). State machine and
its own unit tests live in `src/scripts/press-play.ts` /
`spec/press-play.test.ts`, independent of Week 1's `one-more-episode.ts`.

**Evaluation, as of these Phase 5 working changes (not yet committed):**

- Week 1's own interaction tests (`spec/one-more-episode.test.ts`) still
  pass, unmodified — no regression.
- Week 2's new interaction tests (`spec/press-play.test.ts`) pass.
- `pnpm typecheck`, `astro build`, the build's accessibility checker, and
  its broken-link checker all pass.
- `curriculum.test.ts`'s narrative-completeness check now passes for both
  Week 1 and Week 2.
- The only remaining `curriculum.test.ts` failure is the expected one:
  Weeks 3–12 still have no lecture or session content at all.

**Design conclusion:** the episode structure and the pure-logic/thin-component
interaction pattern held up across two mechanics with no forcing. That's
real evidence the pattern generalises, but it's still limited evidence —
both Week 1 and Week 2's interactions are discrete click/choice tasks with a
fixed number of rounds and a reveal step. This is not yet grounds to claim
the template is fully validated for all remaining weeks.

**Main remaining concern:** a future week should exercise a substantially
different interaction shape — continuous input, ordering/ranking, or
anything that isn't a button-grid choice repeated over fixed rounds —
before assuming every future episode can reuse exactly this interaction
structure.

### Phase 6 — stress-test the pattern on a non-button interaction (Week 6)

**Goal:** Phase 5's main remaining concern was that Weeks 1 and 2 are both
discrete click/choice tasks with a fixed number of rounds. Phase 6 uses
Week 6 ("Time Perception") specifically to test whether the six-part
structure and the pure-logic/thin-component/tests pattern survive an
interaction shape that isn't a button grid at all, before templating the
remaining nine weeks.

**Why the mechanic is substantially different:** "The Guessing Clock" has no
mid-round choice and no buttons deciding the outcome. The input is a
continuous `<input type="range">` estimate, not a category; the outcome is a
signed numeric error against a real duration, not a tally of picks; and, for
the first time, the interaction depends on genuinely elapsed wall-clock time
(measured with `performance.now()`) rather than a static per-round config
difference. The debrief has to talk in magnitudes (seconds over/under, and a
comparison across conditions) instead of counting clicks.

**What was reused from the template:** the six-part episode structure
(question → explanation → example → interaction → debrief → reflection /
prev-next); the pure-logic-module / thin-`.astro`-component / focused-tests
split (`src/scripts/time-perception.ts`, `spec/time-perception.test.ts`,
`src/components/TimePerceptionExperiment.astro`); a baseline round the other
conditions are compared against; a debrief that explicitly names the
mechanism and ties it back to the week's stated question; and the same n=1
/ demonstration-not-evidence discipline, made stronger here because duration
estimates are noisier than a click choice.

**What had to change:** the logic module owns round configuration, state,
response recording, signed-error calculation, over/under/accurate
classification, completion, and the cross-condition comparison — but it
takes the round's *measured* elapsed time as a plain argument rather than
owning a clock, so it stays deterministic and DOM-free. The component owns
`performance.now()`/`setTimeout` for timing, the filler-content cycling
during a round, the slider UI, and rendering. The slider starts at its
minimum with no pre-filled "plausible" value and the confirm button stays
disabled until the visitor actually drags it, so the default itself can't
double as an anchor.

**Evaluation, as of these Phase 6 working changes (not yet committed):**

- Week 1's and Week 2's own interaction tests
  (`spec/one-more-episode.test.ts`, `spec/press-play.test.ts`) still pass,
  unmodified — no regression.
- Week 6's new interaction tests (`spec/time-perception.test.ts`, 13 tests)
  pass, covering initial state, immutable transitions, completion and its
  no-op after completion, exactly-one-round-per-condition, identical
  `actualDurationMs` across all three rounds, signed-error calculation,
  over/under/accurate classification (including the tolerance boundary),
  clamping of out-of-range estimates, the per-round summary, and the
  cross-condition comparison.
- `pnpm typecheck`, `astro build`, the build's accessibility checker, and
  its broken-link checker all pass; 17 pages generated.
- `curriculum.test.ts`'s narrative-completeness check passes for Weeks 1, 2,
  and 6. Its week-existence check now lists only 3, 4, 5, 7, 8, 9, 10, 11,
  12 as missing — Week 6 has moved from "missing" to "present," exactly the
  expected effect and nothing else.
- The same headless-browser limitation Phase 3 recorded still applies: this
  session's container can't run headless Chromium (missing system shared
  libraries, no root to install them), so the slider's actual click-and-drag
  behaviour and the real-time filler cycling are verified by reading the
  component's logic and by the unit tests, not by a live rendered
  click-through. That gap is unchanged from Phase 3, not new to Phase 6, but
  it matters more here than for Weeks 1–2 because this is the first
  interaction whose correctness depends on real elapsed time rather than a
  static config value.

**Psychological/design risks accepted, and how they were handled:**

- *Timer drift:* the component measures actual elapsed time with
  `performance.now()` at the moment a round ends, rather than trusting the
  configured duration blindly, so tab-throttling or device slowness affects
  the *reported* duration honestly rather than silently.
- *Anchoring:* the slider has no pre-filled plausible-looking value and the
  confirm button is disabled until touched.
- *Confound between pacing and topical interest:* the absorbing condition's
  filler lines are deliberately flat, neutral fragments (not jokes, not
  drama) so the manipulation is about *pacing/variety*, not about one
  condition being more entertaining than another for unrelated reasons.
- *Accessibility limitation, disclosed rather than hidden:* the absorbing
  round's fast-changing lines are not read out to screen readers in real
  time (an `aria-live` region firing every ~1.2 seconds would be its own
  disruptive experience, and would arguably test something other than this
  week's mechanism). A screen-reader user can complete every round and see
  the same final comparison, but doesn't get an equivalent moment-to-moment
  experience of the "information-dense" condition that a sighted visitor
  gets. This is named explicitly in the page's debrief rather than left
  implicit.

**Design conclusion:** the six-part structure and the
logic-module/thin-component/tests split held up on an interaction with a
genuinely different shape — continuous input, real elapsed time, and a
numeric rather than categorical outcome — with the same architectural
division of labour as Weeks 1 and 2, just a different owner for "measuring
time" (the component) versus "interpreting it" (the module). That's real
evidence the template isn't secretly button-grid-shaped; it's still only
three data points, and the live click-through gap means the slider's actual
in-browser feel remains unverified in this environment.

Next: Phase 7 — decide, informed by Phases 5 and 6, how the remaining nine
weeks get built (one or a few at a time, per CLAUDE.md's build order), and
find an environment where a real dev-server click-through of Weeks 1, 2,
and 6 is actually possible before leaning further on any of them as
templates.

Citations above follow the format the assessment page asks for: link text is
the commit hash or range, the link target is this repo's commit or compare
URL. Screenshots, when a later phase needs one, get committed to the repo and
linked with a **relative** path (`![alt text](docs/before.png)`) so they
render on GitHub; they don't replace a citation.

## Before you ship

`pnpm check:evidence` verifies that this comment is gone, that your citations
resolve to real commits, that a crit week's reflection entry is in
`reflections/`, and that your `CLAUDE.md` is there. It checks that your account
is traceable, not that it is good: that is the marker's call.

Images aren't checked: unlike a citation whose SHA doesn't resolve, a broken
image is visible the moment this file is rendered on GitHub.
