# BitElevate Pathfinder: Technical Report

## 1. Problem statement

I reviewed all twelve main pages of cynbit.in. BitElevate, the paid 60-day remote internship (₹3,999), is the page with the most concrete offer and the clearest conversion path, but the journey into it has gaps:

- **A dead interaction.** `/bitelevate/paths` promises "Design your own career" with a "Generate My Custom Path" button and a fake system log. Nothing happens when a student reaches it.
- **A broken promise.** The BitElevate page links "View full 60-day syllabus" to that Paths page, which contains no syllabus. The two pages also contradict each other: one says "we've demolished the rigid curriculum", the other sells a fixed 60-day roadmap.
- **A choice with no guidance.** Students must pick one of six labs from names alone, which is a high-friction decision at the moment of payment.
- **An invisible differentiator.** The 14-day exam freeze is a real advantage for engineering students, but it appears only in the FAQ and pricing bullets. Nobody can see what their own schedule would look like.
- **No lead capture before payment.** The only options are paying ₹3,999 or contacting the team cold.

**Hypothesis:** a short, personalised, shareable plan that shows a student their lab, their dates and their exam freeze will raise the share of Paths-page visitors who enrol or enquire, and will give the team a lead with context.

## 2. Solution

BitElevate Pathfinder is a six-question flow (level, interests, languages, goal, hours per day, start and optional exam date). It returns:

1. a ranked list of all six labs with a relative fit score and plain-language reasons,
2. a plan for each of the top three labs: five dated phases, lab-specific milestones, a 60-day calendar strip, and an exam freeze inserted at the right day with all later dates shifted,
3. a short share link (`#/p/<id>`) that reloads the exact saved plan,
4. a form to send the plan to the BitElevate team, and a link to enrol.

## 3. Stack choices

| Layer | Choice | Why |
|---|---|---|
| Database | MongoDB + Mongoose | Plans are self-contained documents (answers + result). Storing the result keeps old share links stable if the catalog changes. Unique index on `shortId`, index on lead email. |
| API | Express 4 | Small surface (5 routes). Helmet, CORS allow-list, 10 KB body limit and a rate limiter on write routes. |
| UI | React 18 + Vite | Fast builds, 49 KB gzipped JS. Hash routing keeps share links working on any static or server host with no rewrite rules. |
| Recommendations | Deterministic scoring, no LLM | Instant, free, testable and explainable ("why this lab"). No API key or per-request cost, and results never vary between runs. An LLM could later explain results, but should not decide them. |
| Hosting | One Node service serving the built client | One URL, no CORS in production, fits a free Render tier with MongoDB Atlas. |
| Testing | `node:test` (built in) | No test dependency to maintain. |

## 4. Implementation

**Architecture.** `client/` (React) calls `server/` (Express). The server owns the catalog, validation and engine, and the client reads quiz options from `/api/options`, so there is one source of truth. A store interface (`create`, `findById`, `attachLead`) has two implementations: Mongo for production and in-memory for tests and local development.

**Scoring.** For each lab: interest weights (0-3, doubled) + language fit + goal fit, minus a difficulty penalty for beginners or plus a small bonus for experienced learners. Scores are shown relative to the best match (best = 100%), and each lab with a strong signal carries up to three human-readable reasons.

**Date logic (the core of the feature).** Sprint day *n* maps to `start + (n-1)` days. If the student's first exam day falls on sprint day *d* (0 ≤ d < 60), every later day shifts by 14. Phase start and end dates, the finish date and the calendar all derive from that one function, so they cannot disagree. The phase containing the freeze simply spans it.

**Validation and safety.** Whitelisted option IDs, bounded hours and dates, strict ISO-date parsing (rejects `2026-02-30`), 10-character hex id check before any lookup, email normalisation, JSON parse errors returned as 400, and generic 500 messages with no stack traces.

**UX.** Single-page quiz with real `fieldset`/`legend` groups, `aria-pressed`/`radio` states, field-level errors, visible focus, light and dark themes, reduced-motion respect, and a layout that collapses to one column under 560 px. The 60-day strip has a text alternative.

## 5. Results

What I measured on this build:

| Check | Result |
|---|---|
| Automated tests | 16 of 16 pass: 11 engine/validation (ranking sanity, freeze date arithmetic, level adaptations, bad input) and 5 API integration (create, fetch, lead, 400/404 paths) |
| End-to-end smoke test | Production build served by Express; quiz payload created a plan, loaded it back by id, SPA fallback returned 200 |
| Engine latency | about 0.07 ms per recommendation; response about 6.4 KB |
| Client bundle | 153 KB JS (49.5 KB gzip) and 5.5 KB CSS (1.9 KB gzip) |
| Example | Beginner, design + UI, JS, 1 h/day, exam on 23 Nov, start 2 Nov: best match Frontend Ops Dashboard Lab, freeze 23 Nov to 6 Dec, finish 14 Jan 2027, plus a pacing note |

What I have **not** measured: real user behaviour. No usability tests or conversion data exist yet, so I make no claim about uplift. To test the hypothesis, instrument these events and compare against the current Paths page: quiz started, quiz completed, plan shared, lead sent, click-through to enrol. A 50/50 split on the Paths page would give a clean comparison.

## 6. Limitations and next steps

- Weights are my judgement from the public lab descriptions; the BitElevate mentors should calibrate them using real outcomes.
- The six labs are hard-coded from the public page. A production version would load them from the CMS or a Mongo collection with an admin screen.
- Days 57-60 of the sprint are treated as capstone buffer, because the public roadmap lists eight weeks against a 60-day sprint.
- Leads are stored but there is no admin view or email notification yet. Next: a protected leads list, a transactional email on submit, and a reminder before the freeze starts.
- Porting into the existing Next.js site: the engine is framework-free and can be reused as an API route; the React components can move over unchanged.
- Deployment: the repo includes `render.yaml` and a README walkthrough; the live URL is produced by following those steps with a MongoDB Atlas connection string.
