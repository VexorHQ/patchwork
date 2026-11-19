// Small date helpers. Kept separate so the other lib modules share one
// definition of "today" and "how many days ago".

export function todayKey(now = new Date()) {
  const d = new Date(now);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysSince(iso, now = new Date()) {
  const ms = new Date(now).getTime() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
