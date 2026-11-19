# Patchwork

Four tools that don't belong together — markdown notes, GitHub issues, a
Pomodoro timer, and a "today" briefing — stitched into one workday.

## Why

A workday pulls in four directions: you write notes in one app, check GitHub
in another, run a timer somewhere else, and keep the plan in your head.
Patchwork puts all four on one page, with the seams showing on purpose. The
stitched borders and different paper tints are the point: this is a
Frankenstein app, and it looks like one.

## What it does

- **Notes** — write markdown, see it rendered live. Notes save themselves as
  you type and come back when you reload.
- **GitHub issues** — type `owner/name` and see the open issues of that public
  repo, oldest first, with labels and links. No login, no token.
- **Pomodoro** — 25-minute work blocks, 5-minute breaks, a 15-minute break
  after every fourth block. Reloading mid-block doesn't restart it.
- **Today** — a short briefing computed from the other three: how many open
  issues, how many notes, how many blocks done, the oldest issue, and one
  suggested next step.

Everything runs in the browser. Notes, timer state, and the watched repo live
in localStorage on your machine — nothing is sent anywhere. Only the GitHub
issues need a network connection, and the app says so when it's missing.

## Run it

```sh
npm install
npm run dev      # develop, with hot reload
npm run build    # production build into dist/
npm run preview  # serve the build locally
npm test         # unit + property tests
```

The build output is static files — host it anywhere that serves HTML.

## How it was built (Kiro)

This was built with Kiro's spec-driven workflow, and the `.kiro` folder is
the evidence:

- `.kiro/specs/patchwork-dashboard/` — `requirements.md` (acceptance criteria
  in EARS format), `design.md` (architecture, decisions, what was rejected),
  `tasks.md` (the implementation checklist, checked off as it was done).
- `.kiro/steering/` — `product.md` (what the app is, always loaded),
  `tech.md` and `structure.md` (conventions, loaded when working in `src/`).
- `.kiro/hooks/` — `test-on-save.json` (runs `npm test` whenever a source
  file is saved) and `check-requirements.json` (after a spec task finishes,
  checks what changed against the acceptance criteria and reports which ones
  are met and which are not).

The logic that can be tested without a browser lives in `src/lib/` as pure
functions, covered by `tests/` — including one property test with
`fast-check` for the briefing (for any list of issues, the counts match and
the oldest issue is the earliest).

## Limits, stated plainly

- One person, one browser. Notes live in localStorage; two tabs don't sync,
  and clearing browser data clears the notes.
- The GitHub API without a login allows 60 requests per hour per IP. That's
  plenty for a page that fetches on load and on demand, but it's a real
  limit — the app says so when it hits it.
- The timer has no sound. The mode change is a visual change and a line of
  text.

## Layout

```
.kiro/specs/patchwork-dashboard/   requirements, design, tasks
.kiro/steering/                    product, tech, structure
.kiro/hooks/                       test-on-save, check-requirements
src/lib/                           dates, notes, github, timer, briefing (pure)
src/components/                    NotesPanel, IssuesPanel, TimerPanel, BriefingPanel
src/App.jsx                        layout + shared state
src/index.css                      the patchwork look
tests/                             unit + property tests
```

Built for Kiroween 2026 by Vexor. Apache-2.0.
