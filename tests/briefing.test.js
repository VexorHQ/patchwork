// Tests for the briefing, including one property test with fast-check:
// for any list of issues, the counts match and the oldest issue is the one
// with the earliest created date.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { buildBriefing } from "../src/lib/briefing.js";

const NOW = new Date("2026-11-19T12:00:00Z");
const daysAgo = (n) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe("buildBriefing", () => {
  it("counts everything and names the oldest issue", () => {
    const briefing = buildBriefing({
      notes: [
        { id: "a", body: "Deploy checklist", updatedAt: daysAgo(1) },
        { id: "b", body: "Ideas", updatedAt: daysAgo(2) },
      ],
      issues: [
        { number: 10, title: "Old bug", createdAt: daysAgo(18), url: "https://github.com/x/y/issues/10" },
        { number: 42, title: "New feature", createdAt: daysAgo(2), url: "https://github.com/x/y/issues/42" },
      ],
      sessionsToday: 2,
      now: NOW,
    });
    assert.equal(briefing.issueCount, 2);
    assert.equal(briefing.noteCount, 2);
    assert.equal(briefing.sessionsToday, 2);
    assert.equal(briefing.oldestIssue.number, 10);
    assert.equal(briefing.oldestIssue.ageDays, 18);
    assert.match(briefing.suggestion, /Start with #10/);
  });

  it("with no issues, the suggestion is the most recent note", () => {
    const briefing = buildBriefing({
      notes: [{ id: "a", body: "Deploy checklist", updatedAt: daysAgo(1) }],
      issues: [],
      sessionsToday: 0,
      now: NOW,
    });
    assert.match(briefing.suggestion, /Deploy checklist/);
  });

  it("with nothing at all, the suggestion is to start a work block", () => {
    const briefing = buildBriefing({ notes: [], issues: [], sessionsToday: 0, now: NOW });
    assert.equal(briefing.issueCount, 0);
    assert.equal(briefing.oldestIssue, null);
    assert.match(briefing.suggestion, /start a work block/i);
  });
});

describe("buildBriefing property", () => {
  it("counts match the inputs, and the oldest issue is always the earliest", () => {
    const issueArb = fc.record({
      number: fc.integer({ min: 1, max: 10000 }),
      title: fc.string({ minLength: 1, maxLength: 40 }),
      createdAt: fc.date({ min: new Date("2026-01-01"), max: new Date("2026-11-19") }).map((d) => d.toISOString()),
      url: fc.constant("https://github.com/x/y/issues/1"),
    });
    const noteArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 10 }),
      body: fc.string({ minLength: 0, maxLength: 40 }),
      updatedAt: fc.date({ min: new Date("2026-01-01"), max: new Date("2026-11-19") }).map((d) => d.toISOString()),
    });

    fc.assert(
      fc.property(
        fc.array(issueArb, { maxLength: 20 }),
        fc.array(noteArb, { maxLength: 20 }),
        fc.integer({ min: 0, max: 8 }),
        (issues, notes, sessionsToday) => {
          const briefing = buildBriefing({ notes, issues, sessionsToday, now: NOW });
          if (briefing.issueCount !== issues.length) return false;
          if (briefing.noteCount !== notes.length) return false;
          if (briefing.sessionsToday !== sessionsToday) return false;
          if (issues.length === 0) {
            if (briefing.oldestIssue !== null) return false;
          } else {
            const earliest = [...issues].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0];
            if (briefing.oldestIssue.number !== earliest.number) return false;
            if (!briefing.suggestion.includes(`#${earliest.number}`)) return false;
          }
          return true;
        }
      ),
      { numRuns: 200 }
    );
  });
});
