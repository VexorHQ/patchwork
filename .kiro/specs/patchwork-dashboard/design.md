# Design: Patchwork

## Overview

Patchwork is a Vite + React single-page app with no backend. Everything runs
in the browser: notes and timer state in localStorage, GitHub issues from the
public API, and the briefing computed from those three sources on every
render. The build output is static files — it can be hosted anywhere that
serves HTML.

## Architecture

```
index.html
  └─ src/main.jsx            mounts App, imports index.css
  └─ src/App.jsx             layout (four panels) + shared state
  └─ src/lib/notes.js        note CRUD + localStorage persistence (pure)
  └─ src/lib/github.js       GitHub API fetch + response shaping (pure-ish)
  └─ src/lib/timer.js        Pomodoro state machine (pure)
  └─ src/lib/briefing.js     "today" summary, computed from notes + issues + sessions (pure)
  └─ src/components/
       NotesPanel.jsx        editor + live markdown preview + note list
       IssuesPanel.jsx       repo picker + issue list
       TimerPanel.jsx        countdown + start/pause/reset + session count
       BriefingPanel.jsx     the computed summary + suggested next step
  └─ src/index.css           the patchwork look (stitched borders, paper tints)
```

State lives in `App.jsx` (React state + `useEffect` for persistence). The
`lib/` modules hold the logic that can be tested without a browser: nothing in
`lib/` imports React or touches the DOM, so `node --test` covers it.

## Components and responsibilities

### Notes (`lib/notes.js` + `NotesPanel.jsx`)

- A note is `{ id, body, updatedAt }`. The title is derived: the first line
  of the body, or "Untitled note".
- `loadNotes()` / `saveNotes()` read and write one localStorage key
  (`patchwork.notes.v1`). Saving is debounced to 500ms after the last
  keystroke so typing never blocks on storage.
- The preview renders markdown with the `marked` package. Raw HTML typed
  into a note is passed through by marked — that is acceptable here because a
  note is only ever shown to the person who wrote it, on their own machine.
  If this ever becomes a shared app, sanitise the rendered HTML first.
- Deleting a note asks for confirmation with the browser's `confirm()` — the
  simplest honest confirmation for a small app, and it works everywhere.

### GitHub issues (`lib/github.js` + `IssuesPanel.jsx`)

- `fetchIssues(owner, repo)` calls
  `https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=30`
  with no auth headers. Unauthenticated GitHub allows 60 requests per hour
  per IP, which is plenty for a page that fetches on load and on demand.
- The response is shaped into `{ number, title, labels, createdAt, ageDays,
  url }`. Pull requests are filtered out (the API returns them mixed in with
  issues; they carry a `pull_request` field).
- Errors are mapped to plain language: 404 → "I can't find that repository —
  check the owner and name", 403 → "GitHub is rate-limiting requests right
  now, try again in a bit", network failure → "No connection — showing the
  last list I fetched".
- The watched repo is stored in localStorage (`patchwork.repo.v1`). The last
  good issue list is kept in memory so a failed refresh doesn't blank the
  panel.

### Timer (`lib/timer.js` + `TimerPanel.jsx`)

- A small state machine with three modes: `work` (25 min), `shortBreak`
  (5 min), `longBreak` (15 min). After four completed work blocks, the next
  break is long.
- The timer stores its state as `{ mode, startedAt, endsAt, pausedAt,
  sessionsToday }` in localStorage (`patchwork.timer.v1`). On reload, the
  remaining time is recomputed from `endsAt` and the clock — so a reload
  mid-block doesn't restart it, and a block that ended while the page was
  closed is counted as finished when the page comes back.
- `sessionsToday` resets when the calendar day changes. The "today" in the
  briefing uses the same day boundary.
- No audio. The mode change is shown by the panel's border colour and a
  short line of text ("Work block done — take five minutes").

### Briefing (`lib/briefing.js` + `BriefingPanel.jsx`)

- `buildBriefing({ notes, issues, sessionsToday, now })` returns
  `{ issueCount, noteCount, sessionsToday, oldestIssue, suggestion }`.
- The suggestion is one line, picked in this order: the oldest open issue
  ("Start with #42 — it's been open 18 days"), else the most recently edited
  note ("Pick up where you left off in 'Deploy checklist'"), else "Start a
  work block".
- It is computed on every render from the current state — never cached, never
  from stale data. The function is pure, so it's the easiest thing in the app
  to test, and it has a property test (see Testing).

## Data flow

```
localStorage ──► App state (notes, repo, timer)
GitHub API  ──► App state (issues, on load + on demand)
App state   ──► BriefingPanel (computed on every render)
App state   ──► localStorage (on change, debounced for notes)
```

There is no server state and no cross-user state. Two people opening the app
see their own notes, their own timer, and the same public issues.

## The look (Requirement 5)

CSS only, no images. Each panel is a "patch" of paper: a slightly different
background tint, a dashed 2px border in a dark thread colour (the seam), and
a small stitched label in the corner naming the panel. The page background is
a neutral linen colour. The four panels sit in a 2×2 grid on wide screens and
stack in one column under 700px. Headings use a monospace face for the
stitched-label feel; body text uses the system sans-serif stack.

## Decisions (and what was rejected)

- **Vite + React, not a framework with a server.** The app has no server
  work to do. A static build keeps hosting trivial and the submission
  verifiable: `npm run build` produces files anyone can serve.
- **localStorage, not IndexedDB.** The data is small (a few dozen notes, a
  timer, one repo name). localStorage is synchronous, simple, and enough.
  IndexedDB would add complexity for no benefit here.
- **`marked` for markdown, not a hand-rolled renderer.** Markdown parsing
  has more edge cases than it looks like. `marked` is a single small
  dependency that does it properly, and it escapes raw HTML by default.
- **No auth, no GitHub token.** The public API is enough for reading open
  issues, and "no login" is a requirement, not a shortcut.
- **No audio for the timer.** Autoplay audio is annoying and often blocked.
  A visual change and a text line do the job.
- **No real-time sync between tabs.** Two tabs would each keep their own
  state. That's acceptable for a single-user tool; the spec doesn't ask for
  multi-tab sync, and adding it would mean storage events and merge logic
  for a problem nobody in the target audience has.

## Testing

- `node --test` covers `lib/`: notes (title derivation, save/load round-trip
  with a localStorage stub), timer (mode transitions, long break after four
  sessions, reload recovery), briefing (counts, oldest issue, suggestion
  order), and GitHub response shaping (pull requests filtered out, error
  mapping).
- One property test with `fast-check`: for any list of issues, the
  briefing's `oldestIssue` is always the one with the earliest `createdAt`,
  and its `issueCount` always equals the list length. This is the kind of
  invariant a handful of examples can miss.
- The UI is verified by building and opening the page (`npm run build`,
  `npm run preview`) and walking through the four panels by hand: create a
  note, watch the repo, start the timer, read the briefing.
