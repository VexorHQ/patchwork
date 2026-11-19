// GitHub issues, from the public API with no login.
//
// The API returns pull requests mixed in with issues; they carry a
// `pull_request` field, so they're filtered out. Errors are mapped to plain
// language — the panel shows the message, never a status code.

import { daysSince } from "./dates.js";

export const REPO_KEY = "patchwork.repo.v1";

export function parseRepo(input) {
  const text = String(input || "").trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  const [owner, repo] = text.split("/");
  if (!owner || !repo || text.split("/").length !== 2) {
    return { error: "Write the repository as owner/name, for example facebook/react." };
  }
  return { owner, repo };
}

export function issuesUrl(owner, repo) {
  return `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30`;
}

export function shapeIssue(raw, now = new Date()) {
  return {
    number: raw.number,
    title: raw.title || "(no title)",
    labels: (raw.labels || []).map((l) => (typeof l === "string" ? l : l.name)).filter(Boolean),
    createdAt: raw.created_at,
    ageDays: daysSince(raw.created_at, now),
    url: raw.html_url,
  };
}

export function shapeIssues(rawList, now = new Date()) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((r) => r && !r.pull_request)
    .map((r) => shapeIssue(r, now))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export function errorMessage(status) {
  if (status === 404) return "I can't find that repository — check the owner and name.";
  if (status === 403) return "GitHub is rate-limiting requests right now — try again in a bit.";
  if (status === 401) return "GitHub refused the request — this repo may be private.";
  return `GitHub answered with an error (status ${status}).`;
}

export async function fetchIssues(owner, repo, fetchFn = fetch, now = new Date()) {
  let res;
  try {
    res = await fetchFn(issuesUrl(owner, repo), {
      headers: { Accept: "application/vnd.github+json" },
    });
  } catch {
    return { ok: false, error: "No connection — check your network and try again." };
  }
  if (!res.ok) return { ok: false, error: errorMessage(res.status) };
  const raw = await res.json();
  return { ok: true, issues: shapeIssues(raw, now) };
}
