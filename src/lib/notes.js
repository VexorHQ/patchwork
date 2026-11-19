// Notes. A note is { id, body, updatedAt }; the title is derived from the
// first non-empty line of the body, never stored separately.
//
// Persistence is through a `store` object with getItem/setItem (localStorage
// in the app, a stub in tests). A corrupt stored value never breaks the page
// — it just means "no notes yet".

export const NOTES_KEY = "patchwork.notes.v1";

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function noteTitle(note) {
  const first = (note?.body || "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!first) return "Untitled note";
  return first.replace(/^#+\s*/, "").slice(0, 80);
}

export function createNote(body = "") {
  return { id: uid(), body, updatedAt: new Date().toISOString() };
}

export function touchNote(note, body, now = new Date()) {
  return { ...note, body, updatedAt: new Date(now).toISOString() };
}

export function sortNotes(notes) {
  return [...(notes || [])].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
}

export function loadNotes(store) {
  try {
    const raw = store.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n) => n && typeof n.id === "string" && typeof n.body === "string"
    );
  } catch {
    return [];
  }
}

export function saveNotes(store, notes) {
  try {
    store.setItem(NOTES_KEY, JSON.stringify(notes || []));
  } catch {
    // Storage full or unavailable (private mode): the note still lives in
    // memory for this session. Losing it on reload is better than crashing.
  }
}
