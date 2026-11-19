// Tests for the GitHub module. The fetch is stubbed — these tests check the
// shaping and the error messages, not the network.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseRepo,
  issuesUrl,
  shapeIssues,
  errorMessage,
  fetchIssues,
} from "../src/lib/github.js";

const NOW = new Date("2026-11-19T12:00:00Z");

describe("parseRepo", () => {
  it("accepts owner/name and a full GitHub URL", () => {
    assert.deepEqual(parseRepo("facebook/react"), { owner: "facebook", repo: "react" });
    assert.deepEqual(parseRepo("https://github.com/facebook/react"), { owner: "facebook", repo: "react" });
    assert.deepEqual(parseRepo("  vitejs/vite/ "), { owner: "vitejs", repo: "vite" });
  });

  it("rejects anything that isn't owner/name", () => {
    assert.ok(parseRepo("facebook").error);
    assert.ok(parseRepo("").error);
    assert.ok(parseRepo("a/b/c").error);
  });
});

describe("issuesUrl", () => {
  it("builds the public API URL for open issues", () => {
    assert.equal(
      issuesUrl("facebook", "react"),
      "https://api.github.com/repos/facebook/react/issues?state=open&per_page=30"
    );
  });
});

describe("shapeIssues", () => {
  const raw = [
    { number: 1, title: "Old bug", labels: [{ name: "bug" }], created_at: "2026-11-01T10:00:00Z", html_url: "https://github.com/x/y/issues/1" },
    { number: 2, title: "A pull request", labels: [], created_at: "2026-11-02T10:00:00Z", html_url: "https://github.com/x/y/pull/2", pull_request: {} },
    { number: 3, title: "New feature", labels: ["enhancement", { name: "good first issue" }], created_at: "2026-11-18T10:00:00Z", html_url: "https://github.com/x/y/issues/3" },
  ];

  it("filters out pull requests, keeps the rest, oldest first", () => {
    const issues = shapeIssues(raw, NOW);
    assert.deepEqual(issues.map((i) => i.number), [1, 3]);
    assert.equal(issues[0].title, "Old bug");
    assert.equal(issues[0].ageDays, 18);
    assert.deepEqual(issues[1].labels, ["enhancement", "good first issue"]);
  });

  it("tolerates a non-array response", () => {
    assert.deepEqual(shapeIssues(null, NOW), []);
    assert.deepEqual(shapeIssues("nope", NOW), []);
  });
});

describe("errorMessage", () => {
  it("says what happened in plain language", () => {
    assert.match(errorMessage(404), /can't find that repository/);
    assert.match(errorMessage(403), /rate-limiting/);
    assert.match(errorMessage(500), /status 500/);
  });
});

describe("fetchIssues", () => {
  it("returns the shaped issues on success", async () => {
    const stub = async () => ({
      ok: true,
      json: async () => [
        { number: 7, title: "Fix it", labels: [], created_at: "2026-11-19T10:00:00Z", html_url: "https://github.com/x/y/issues/7" },
      ],
    });
    const result = await fetchIssues("x", "y", stub, NOW);
    assert.equal(result.ok, true);
    assert.equal(result.issues.length, 1);
    assert.equal(result.issues[0].number, 7);
  });

  it("returns a plain-language error on a 404 and on a network failure", async () => {
    const notFound = async () => ({ ok: false, status: 404 });
    assert.equal((await fetchIssues("x", "y", notFound, NOW)).error, errorMessage(404));

    const offline = async () => {
      throw new Error("fetch failed");
    };
    const result = await fetchIssues("x", "y", offline, NOW);
    assert.equal(result.ok, false);
    assert.match(result.error, /No connection/);
  });
});
