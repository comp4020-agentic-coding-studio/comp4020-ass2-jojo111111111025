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

Next: Phase 4 — decide whether the remaining eleven weeks get templated
from Week 1's shape as-is, or whether anything Week 1 surfaced (the
component's API, the frontmatter shape) is worth adjusting first, then bring
`curriculum.test.ts` back to green one week at a time rather than in one
full-site pass.

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
