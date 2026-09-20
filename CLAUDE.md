# COMP4020 Assignment 2

This repository is the course website for a COMP4020 Assignment 2 project: **One More Episode: The Psychology of Binge-Watching**. The project is an academic course site about why people continue watching, how psychological and streaming mechanisms influence viewing behaviour, and how the viewing loop can be interrupted.

The deployed artefact is what matters. The site should work as a coherent university course website at both required marking viewports: **1920×1080 desktop** and **390×844 mobile**. The rendered page is the source of truth, so inspect the actual page when possible rather than assuming that the source code looks correct.

## How to work in here

- Inspect the existing project before making changes.
- Keep the development server available when useful and inspect rendered pages for visual or interaction changes.
- Make focused changes that solve the actual requirement; do not redesign unrelated parts of the site.
- When a check fails, read the failure output before changing code. Treat the failure as evidence about what is actually wrong.
- Run the relevant checks after meaningful changes.
- Before shipping, inspect the final diff and verify that no unexpected files changed.
- Never knowingly commit a failing state.
- Do not commit or push unless explicitly requested.

The Agent is an implementation and verification partner. It can inspect the repository, propose implementation approaches, implement components and TypeScript logic, develop course content, write tests, diagnose failures, and make targeted content, structural, or CSS improvements.

The Agent does not own the course design. Do not independently change the course concept, teaching progression, psychological questions, assessment purpose or weighting, or major information architecture. When a requirement is ambiguous, inspect the existing project and course requirements first and ask rather than inventing a new direction.

## The checks (your sensors)

The important local checks are:

- **`pnpm check`** — runs the project's automated test/check suite. A failing test is evidence that an expected contract or behaviour is no longer true.
- **`pnpm check:evidence`** — checks the process evidence required by the course, including `PROCESS.md` commit citations and the required process files.
- **`pnpm build`** — builds the Astro site for deployment. A successful local build is necessary but does not replace checking the deployed GitHub Pages artefact.
- **`git diff --check`** — catches whitespace errors in the current diff.

The current project verification has reached **15 test files and 119 passing tests**. The build has generated **61 pages**, with accessibility and broken-link checks reporting no violations. These numbers describe the verified project state and should be rechecked after substantial changes rather than assumed permanently.

Do not invent additional checks or claim that a tool measures something it does not actually measure. Inspect `package.json` and `spec/` when the exact behaviour of the harness is uncertain.

## The stack and deployment

This project uses:

- Astro
- TypeScript
- pnpm
- GitHub Pages

The deployed site lives under the repository base path rather than the domain root. The project uses the existing base-path resolution in `scripts/pages-base.ts` and the Astro deployment configuration. Do not remove or bypass this configuration.

A page or asset working at the local root is not sufficient evidence that it works after deployment. Be especially careful with links, assets, slides, recordings, and navigation paths under the GitHub Pages repository path.

## Course concept

The course is **One More Episode: The Psychology of Binge-Watching**.

The course examines why people continue watching when they intended to stop, how streaming interfaces and psychological mechanisms shape viewing behaviour, and how the viewing loop can be interrupted.

The twelve-week structure is:

1. One More Episode Effect
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
12. Final Episode

The progression is intentional. Weeks 1–6 introduce psychological and streaming/interface mechanisms. Weeks 7–10 examine broader binge-watching patterns and trade-offs. Week 11 focuses on interruption and breaking the loop. Week 12 synthesises the course.

The site should therefore feel like a complete university course rather than a generic replacement of the starter template.

## Interaction strategy

Each week has a bespoke interactive experiment connected to its psychological question.

The project deliberately does not force every week into one identical interaction widget. Different concepts use different interaction forms, including experiments, ranking, countdowns, reward schedules, prediction and time estimation, social signals, and synthesis.

The repository separates interaction concerns where appropriate:

- Astro components provide the interface.
- TypeScript modules in `src/scripts/` contain interaction logic where appropriate.
- Pure or DOM-free logic should remain directly testable when practical.
- Behavioural tests should test meaningful behaviour rather than only checking that markup exists.

Inspect the actual implementation before making architectural claims. Not every interaction is required to use exactly the same pattern.

## Course information architecture

The main course areas include:

- homepage
- lectures
- weekly sessions/schedule
- assessments
- people
- policies
- lecture decks/slides
- weekly quizzes
- recordings or recording placeholders where applicable

Lecture pages should maintain a meaningful relationship between the psychological question, lecture content, weekly interaction, slides, and supporting course material.

Course-wide consistency matters. A page should not contain leftover starter-template content simply because that content was not part of the interaction itself.

## Content rules

Preserve the academic and course-specific purpose of the site.

The Agent should:

- preserve the intended psychological framing;
- avoid unsupported academic claims;
- avoid fake staff credentials, qualifications, affiliations, or contact details;
- avoid replacing course-specific material with generic filler;
- keep information consistent across lectures, sessions, assessments, people, policies, and the homepage;
- treat explanatory text, hierarchy, and surrounding information as part of the artefact.

## Agent and human responsibilities

The Agent helps implement the work, but **the student is responsible for the course design**.

The student decides:

- the course concept;
- the twelve-week structure;
- psychological questions;
- teaching progression;
- relationships between interactions and concepts;
- assessment purpose and weighting;
- major information architecture;
- final content judgement.

The Agent can help turn those decisions into actual code and content, test the result, identify problems, and make focused improvements.

Do not silently replace a teaching decision with an implementation preference.

## Process evidence

`CLAUDE.md` and `PROCESS.md` are part of the assignment's process evidence. The commit history should make the development process legible.

Important commits include:

- [`805d06f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/805d06f) — specification and checkable requirements
- [`20ae414`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/20ae414) — information architecture, content model and interaction strategy
- [`68308d3`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/68308d3) — Week 1 prototype
- [`5b9f548`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/5b9f548) — curriculum completeness enforcement
- [`ba8e792`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/ba8e792) — Week 2 interaction
- [`3f36726`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/3f36726) — Week 6 time-perception experiment
- [`69bcd9d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/69bcd9d) — Weeks 3–12 interactions
- [`a9f39c6`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-jojo111111111025/commit/a9f39c6) — process next steps

These citations should remain consistent with the actual Git history. Do not invent commit meanings or add unsupported history.

`PROCESS.md` provides the detailed reading guide to the development process. Keep it within the assignment's required 400–600 words and preserve working commit citations.

## Final verification workflow

Before considering a change complete:

1. Inspect the relevant existing code and content.
2. Make the smallest appropriate change.
3. Run relevant tests.
4. Inspect the rendered page when visual or interaction behaviour matters.
5. Run `pnpm check`.
6. Run `pnpm check:evidence`.
7. Run `pnpm build`.
8. Run `git diff --check`.
9. Inspect `git diff` and `git status`.
10. Check important pages at 1920×1080 and 390×844.
11. Report what changed and what passed.
12. Wait for explicit instruction before committing or pushing.

Never treat a green local test as proof that the deployed site is correct. Check the actual deployment path and rendered artefact when possible.

## This file is yours

This `CLAUDE.md` is part of the project's harness. It should record useful project-specific rules, recurring failure modes, reliable verification practices, and constraints that help the Agent work effectively.

Keep it honest and current. If the Agent repeatedly makes the same mistake or a project-specific convention becomes important, document that convention here. Do not rewrite the file merely to add generic instructions that do not help this repository.

The goal is not to make the Agent autonomous in deciding what the course should be. The goal is to make the Agent more reliable at implementing, checking, and refining a course whose design decisions remain human-directed.
