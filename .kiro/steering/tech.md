---
inclusion: fileMatch
fileMatchPattern: "src/**"
---

# Tech conventions

- Vite + React, plain JavaScript (no TypeScript). The app is small; types
  would add ceremony without catching real bugs here.
- Logic that can be tested without a browser lives in `src/lib/` as pure
  functions. Nothing in `lib/` imports React or touches the DOM. Components
  in `src/components/` are thin: they render state and call `lib/` functions.
- State lives in `App.jsx`. Panels receive props; they don't fetch or persist
  anything themselves.
- localStorage keys are namespaced `patchwork.<thing>.v1`. Always read with a
  try/catch and fall back to the default — a corrupt stored value must never
  break the page.
- Markdown rendering uses `marked`. Raw HTML in a note is passed through by
  marked — acceptable here because a note is only ever shown to the person
  who wrote it, on their own machine. If this ever becomes a shared app,
  sanitise the rendered HTML before it reaches `dangerouslySetInnerHTML`.
- GitHub calls use the public API with no auth headers. Never add a token,
  and never send localStorage data anywhere.
- Dates and times: store timestamps as ISO strings, compare with `Date.parse`.
  "Today" means the local calendar day.
