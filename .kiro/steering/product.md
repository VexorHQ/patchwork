---
inclusion: always
---

# Patchwork — what this is

A single-page web app for one workday. It stitches four tools that don't
belong together into one screen: markdown notes, GitHub issues for one public
repo, a Pomodoro timer, and a "today" briefing computed from the other three.
The seams are visible on purpose — that's the Frankenstein idea, and the
stitched look is part of the product, not decoration.

The user is one person, on one machine, with no account and no server. Notes
and timer state live in localStorage. GitHub issues come from the public API
with no login. The app must work the moment it opens, and it must say plainly
when something can't be read (no network, unknown repo, rate limit) instead
of showing a blank panel or pretending everything is fine.

When in doubt about a design choice, prefer the simpler thing that a person
can understand and check. The app's whole point is that one screen tells the
truth about the day.
