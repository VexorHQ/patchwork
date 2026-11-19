// The "today" briefing. Pure function: it takes the current notes, issues
// and session count and returns a summary. Computed on every render from
// live state, never cached, so it can never be stale.

import { daysSince } from "./dates.js";
import { noteTitle } from "./notes.js";

export function buildBriefing({ notes = [], issues = [], sessionsToday = 0, now = new Date() } = {}) {
  const sortedIssues = [...issues].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
  const oldestIssue = sortedIssues[0] || null;
  const latestNote = [...notes].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  )[0] || null;

  let suggestion;
  if (oldestIssue) {
    const age = daysSince(oldestIssue.createdAt, now);
    suggestion = `Start with #${oldestIssue.number} — "${oldestIssue.title}" has been open ${age} day${age === 1 ? "" : "s"}.`;
  } else if (latestNote) {
    suggestion = `Pick up where you left off in "${noteTitle(latestNote)}".`;
  } else {
    suggestion = "Nothing is waiting — start a work block.";
  }

  return {
    issueCount: issues.length,
    noteCount: notes.length,
    sessionsToday,
    oldestIssue: oldestIssue
      ? { ...oldestIssue, ageDays: daysSince(oldestIssue.createdAt, now) }
      : null,
    suggestion,
  };
}
