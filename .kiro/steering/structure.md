---
inclusion: fileMatch
fileMatchPattern: "src/**"
---

# Structure and testing

- `src/lib/` — pure logic, one file per concern: `notes.js`, `github.js`,
  `timer.js`, `briefing.js`. Each has a matching test file in `tests/`.
- `src/components/` — one component per panel: `NotesPanel.jsx`,
  `IssuesPanel.jsx`, `TimerPanel.jsx`, `BriefingPanel.jsx`.
- `src/App.jsx` — layout and shared state. `src/main.jsx` — mounts the app.
  `src/index.css` — all styling.
- Tests run with `node --test tests/`. Every fix includes a test that fails
  without the fix. A pure function that can't be tested from Node is a sign
  it belongs in a component, not in `lib/`.
- The property test for `briefing.js` uses `fast-check`. When adding a new
  invariant to the briefing (counts, ordering, suggestion), add it to the
  property test first, then make it pass.
- Keep functions short and named after what they do. A comment should say
  why, not what — the code already says what.
