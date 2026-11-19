# Patchwork — Kiroween 2026 submission draft

Do NOT submit this without the parent's confirmation (the parent asks Vexor
for a yes first). This file is the text to paste into the Devpost form, plus
the plan for the demo video.

## Devpost form

**Title:** Patchwork

**Tagline:** Four tools that don't belong together — notes, GitHub issues, a
Pomodoro timer, and a today briefing — stitched into one workday.

**Category:** Frankenstein (stitching incompatible technologies into one app)

**Bonus prizes:** None taken. (Social Blitz needs Vexor posting — skipped
deliberately. Bonus Blog is possible later if Vexor wants it.)

**Description (paste into "Tell us about your project"):**

> Patchwork is a single-page web app that stitches four things that don't
> belong together into one focused workday tool: a markdown notes editor, a
> GitHub issue tracker, a Pomodoro timer, and a "today" briefing computed from
> the other three. It looks like what it is — four pieces of paper with
> visible seams, each its own tint, stitched into one page.
>
> The point is focus. A workday pulls in four directions: notes in one app,
> GitHub in another, a timer somewhere else, the plan in your head. Patchwork
> puts all four on one screen. Open it in the morning and the briefing tells
> you where the day stands: how many open issues in the repo you're watching,
> how many notes you have, how many work blocks you've done, the oldest open
> issue, and one suggested next step.
>
> Everything runs in the browser. Notes and timer state live in localStorage.
> GitHub issues come from the public API with no login and no token. There is
> no server, no account, and nothing to deploy beyond static files. The app
> says plainly when something can't be read — no network, unknown repo, rate
> limit — instead of showing a blank panel.
>
> It was built with Kiro's spec-driven workflow: the `.kiro` folder in the
> repo holds the full spec (requirements with acceptance criteria, design with
> the decisions and what was rejected, and the task list), steering docs, and
> two agent hooks — one that runs the tests whenever a source file is saved,
> and one that checks a finished task against its acceptance criteria. The
> logic lives in pure functions with unit tests and one property test
> (fast-check) for the briefing.

**How Kiro was used (paste into the "how Kiro was used" field):**

> Spec-driven development, end to end. The spec in
> `.kiro/specs/patchwork-dashboard/` came first: requirements.md (acceptance
> criteria in EARS format), design.md (architecture, decisions, rejected
> alternatives), tasks.md (the checklist, worked through in order). Steering
> docs in `.kiro/steering/` carry the product context and the tech
> conventions. Two agent hooks in `.kiro/hooks/` enforce the workflow: one
> runs `npm test` on every save of a source file, the other checks each
> finished spec task against its acceptance criteria and reports which are
> met. The app itself was built in the Kiro IDE/CLI from that spec, and the
> property test for the briefing was written as part of the spec's testing
> section, not added afterwards.

**Demo video:** (public YouTube link — fill in after recording; under 3 minutes)

**Repo:** (public GitHub URL — fill in after the repo is created under Vexor;
must contain `/.kiro` at the root, with an open-source license)

**Live app URL:** (fill in after hosting the static build — any static host)

## Demo video storyboard (< 3 min)

Recorded in the browser, one voice, plain language, no music.

| Time | What you see | What I say |
|---|---|---|
| 0:00–0:20 | The app, all four panels. | "This is Patchwork. Four tools that don't belong together, stitched into one page: notes, GitHub issues, a timer, and a briefing about today." |
| 0:20–0:55 | The briefing panel. The oldest issue, the suggestion. | "Open it in the morning and it tells you where the day stands. The oldest open issue, and what to do first." |
| 0:55–1:30 | Write a note, watch it render; switch the repo, watch the issues load. | "Notes save themselves. Issues come from GitHub's public API — no login, no token." |
| 1:30–2:10 | Start the timer, show the countdown and the session count. | "Twenty-five minutes of work, five minutes of rest. Reload the page and it doesn't restart — it remembers where it was." |
| 2:10–2:45 | The `.kiro` folder: the spec, the steering docs, the hooks; `npm test` running, 27 tests passing. | "And this is how it was built — a spec first, then the code, with hooks that run the tests on every save. The logic is tested, including a property test for the briefing." |

Keep it under 3 minutes. Cut anything that repeats itself.

## Pre-submit checklist

- [ ] Public GitHub repo under Vexor, with `/.kiro` at the root + LICENSE
- [ ] Static build hosted somewhere public (any static host)
- [ ] Demo video recorded, uploaded to YouTube (public), under 3 minutes
- [ ] Devpost form filled from this file, Frankenstein category selected
- [ ] Kiro free-credit form (4,000 credits) sent before 1 Dec 2026 12:00 PT
      — needs the Kiro account first (browser step, parent)
- [ ] Parent confirmed; Vexor said yes to submitting
