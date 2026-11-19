# Tasks: Patchwork

- [x] 1. Scaffold the app
  - [x] 1.1 Create `package.json` (Vite + React, `marked` for markdown,
        `fast-check` for the property test) and `vite.config.js`
  - [x] 1.2 Create `index.html` and `src/main.jsx` mounting `App`
  - [x] 1.3 Verify `npm install` and `npm run build` succeed

- [x] 2. Notes (Requirement 1)
  - [x] 2.1 Write `src/lib/notes.js`: note shape, title derivation,
        localStorage load/save, debounced save
  - [x] 2.2 Write `NotesPanel.jsx`: note list, editor, live preview with
        `marked`, delete with confirmation, empty state
  - [x] 2.3 Write unit tests for `notes.js`

- [x] 3. GitHub issues (Requirement 2)
  - [x] 3.1 Write `src/lib/github.js`: fetch, response shaping, pull-request
        filtering, error mapping to plain language
  - [x] 3.2 Write `IssuesPanel.jsx`: repo picker, issue list, loading and
        error states, links opening in a new tab
  - [x] 3.3 Write unit tests for `github.js` (shaping + error mapping, with a
        stubbed fetch)

- [x] 4. Pomodoro timer (Requirement 3)
  - [x] 4.1 Write `src/lib/timer.js`: mode state machine, durations,
        long break after four sessions, reload recovery from `endsAt`,
        day-boundary reset of `sessionsToday`
  - [x] 4.2 Write `TimerPanel.jsx`: countdown display, start/pause/resume/
        reset, session count, mode change text
  - [x] 4.3 Write unit tests for `timer.js`

- [x] 5. Today briefing (Requirement 4)
  - [x] 5.1 Write `src/lib/briefing.js`: counts, oldest issue, suggestion
        order
  - [x] 5.2 Write `BriefingPanel.jsx`: the summary and the suggested next
        step
  - [x] 5.3 Write unit tests + one `fast-check` property test for
        `briefing.js`

- [x] 6. The patchwork look (Requirement 5)
  - [x] 6.1 Write `src/index.css`: four paper tints, stitched (dashed)
        borders, corner labels, 2×2 grid, single column under 700px
  - [x] 6.2 Wire the layout in `App.jsx`

- [x] 7. Verify end to end
  - [x] 7.1 `npm test` — all unit + property tests pass
  - [x] 7.2 `npm run build` succeeds; `npm run preview` serves the page
  - [x] 7.3 Walk through by hand: create a note, watch a repo, start the
        timer, read the briefing

- [ ] 8. Submit (needs the parent/browser — NOT done by this agent)
  - [ ] 8.1 Public GitHub repo under Vexor with `/.kiro` at the root
  - [ ] 8.2 Demo video under 3 minutes, public on YouTube
  - [ ] 8.3 Devpost submission (Frankenstein category) — parent confirms,
        Vexor says yes first
  - [ ] 8.4 Kiro free-credit form (4,000 credits) sent before 1 Dec 2026
        12:00 PT — needs the Kiro account first (browser step)
