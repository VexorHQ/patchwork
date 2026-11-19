# Requirements: Patchwork

## Introduction

Patchwork is a single-page web app for a workday that pulls in four
directions at once. It stitches together four tools that don't belong in the
same app — a markdown notes editor, a GitHub issue tracker, a Pomodoro timer,
and a "today" briefing computed from the other three — into one screen, with
the seams showing on purpose. The point is focus: one page, one workday, no
tab-hopping between a notes app, GitHub, and a timer.

The app is entirely client-side. Notes and timer state live in localStorage.
GitHub issues come from the public GitHub API with no login. There is no
server, no account, and nothing to deploy beyond static hosting.

## Glossary

- **Note:** one markdown document, with a title, body, and last-edited time.
- **Watched repo:** a public GitHub repository (owner/name) whose open issues
  the app shows.
- **Session:** one completed Pomodoro work block (25 minutes by default).
- **Briefing:** a short summary the app computes each time the page loads,
  from the notes, the watched repo's issues, and today's sessions.

## Requirements

### Requirement 1: Notes

**User Story:** As a developer, I want to write and keep markdown notes in
the same place I plan my day, so I don't lose a thought to another tab.

#### Acceptance Criteria

1. WHEN I type in the notes editor, THE Patchwork SHALL update the preview
   pane live, rendering headings, bold, italic, lists, code, and links.
2. WHEN I create a note, THE Patchwork SHALL give it the first line of its
   body as its title, or "Untitled note" when the body is empty.
3. WHEN I edit a note, THE Patchwork SHALL save it to localStorage within
   one second of my last keystroke, without me pressing anything.
4. WHEN I reload the page, THE Patchwork SHALL restore all notes exactly as
   I left them, including which note was open.
5. WHEN I delete a note, THE Patchwork SHALL ask me to confirm first, and
   SHALL open another note (or an empty editor) afterwards.
6. WHEN I have no notes, THE Patchwork SHALL show an empty state that tells
   me how to start, instead of a blank panel.

### Requirement 2: GitHub issues

**User Story:** As a developer, I want to see the open issues of one public
repo next to my notes, so I can pick what to work on without opening GitHub.

#### Acceptance Criteria

1. WHEN I enter a repository as `owner/name`, THE Patchwork SHALL fetch its
   open issues from the public GitHub API without asking me to log in.
2. WHEN the fetch succeeds, THE Patchwork SHALL list each issue with its
   number, title, labels, age in days, and a link to the issue on GitHub.
3. WHEN the fetch fails (unknown repo, no network, rate limit), THE Patchwork
   SHALL say so in plain language and keep the last good list on screen if
   there is one.
4. WHEN I change the watched repo, THE Patchwork SHALL remember the new one
   and fetch its issues.
5. WHEN I click an issue, THE Patchwork SHALL open it on GitHub in a new tab.
6. THE Patchwork SHALL NOT send any credentials to GitHub, and SHALL NOT
   write anything to the repository.

### Requirement 3: Pomodoro timer

**User Story:** As a developer, I want a timer that keeps my work in
25-minute blocks with short breaks, so the day has a rhythm instead of
one long blur.

#### Acceptance Criteria

1. WHEN I press start, THE Patchwork SHALL count down from 25:00 and show
   the remaining time in minutes and seconds.
2. WHEN the work block ends, THE Patchwork SHALL switch to a 5-minute break
   and tell me the block is done, with a sound-free visual change (no audio
   autoplay).
3. AFTER four completed work blocks, THE Patchwork SHALL offer a 15-minute
   long break instead of 5 minutes.
4. WHEN I press pause, THE Patchwork SHALL stop the countdown and keep the
   remaining time; WHEN I press resume, THE Patchwork SHALL continue from
   there.
5. WHEN I reload the page mid-block, THE Patchwork SHALL restore the timer
   from the time it was started, not restart it.
6. THE Patchwork SHALL show how many work blocks I have finished today.

### Requirement 4: Today briefing

**User Story:** As a developer, I want one short summary when I open the app
that tells me where the day stands, so I know what to do first.

#### Acceptance Criteria

1. WHEN the page loads, THE Patchwork SHALL show a briefing with: the number
   of open issues in the watched repo, the number of notes, and the number of
   work blocks finished today.
2. WHEN there are open issues, THE Patchwork SHALL name the oldest open issue
   and how many days old it is.
3. WHEN there are no open issues, THE Patchwork SHALL say so instead of
   showing an empty list.
4. WHEN the briefing is computed, THE Patchwork SHALL suggest one next step:
   the oldest open issue when there is one, otherwise the most recently
   edited note, otherwise starting a work block.
5. THE Patchwork SHALL recompute the briefing whenever the notes, the issues,
   or the timer change — never from stale data.

### Requirement 5: The patchwork look

**User Story:** As a user, I want the app to look like what it is — four
different tools stitched together — so the Frankenstein idea is visible, not
just a line in the submission.

#### Acceptance Criteria

1. THE Patchwork SHALL show four panels (Notes, Issues, Timer, Briefing) on
   one page, each with a visibly stitched border (dashed, like a seam).
2. EACH panel SHALL have its own paper-like tint, so the four pieces read as
   different fabrics.
3. THE Patchwork SHALL work on a narrow screen (under 700px wide) by
   stacking the panels in one column.
4. THE Patchwork SHALL NOT use any image assets — the look comes from CSS
   only (borders, background tints, typography).

### Requirement 6: No backend, no account

**User Story:** As a user, I want to open the app and use it immediately,
with nothing to sign up for and nothing to install.

#### Acceptance Criteria

1. THE Patchwork SHALL run entirely in the browser from static files.
2. THE Patchwork SHALL NOT require any login, account, or API key.
3. THE Patchwork SHALL keep all personal data (notes, timer, watched repo)
   in localStorage on my own machine, and SHALL NOT send it anywhere.
4. THE Patchwork SHALL work offline for notes and timer; only the GitHub
   issues need a network connection, and the app SHALL say so when it's
   missing.
