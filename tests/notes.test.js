// Tests for the notes module. Run with `npm test` (node --test).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  noteTitle,
  createNote,
  touchNote,
  sortNotes,
  loadNotes,
  saveNotes,
} from "../src/lib/notes.js";

const store = () => {
  const data = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    _data: data,
  };
};

describe("noteTitle", () => {
  it("uses the first non-empty line, without the markdown heading marks", () => {
    assert.equal(noteTitle({ body: "# Deploy checklist\n\n- step one" }), "Deploy checklist");
    assert.equal(noteTitle({ body: "\n\nJust a line" }), "Just a line");
    assert.equal(noteTitle({ body: "" }), "Untitled note");
    assert.equal(noteTitle({ body: "   \n  " }), "Untitled note");
  });
});

describe("createNote / touchNote / sortNotes", () => {
  it("a new note has an id, empty body, and a timestamp", () => {
    const note = createNote();
    assert.equal(typeof note.id, "string");
    assert.ok(note.id.length > 0);
    assert.equal(note.body, "");
    assert.ok(Date.parse(note.updatedAt));
  });

  it("touching a note updates the body and the timestamp", () => {
    const note = createNote("old");
    const touched = touchNote(note, "new", new Date("2026-11-19T12:00:00Z"));
    assert.equal(touched.body, "new");
    assert.equal(touched.updatedAt, "2026-11-19T12:00:00.000Z");
    assert.equal(touched.id, note.id);
  });

  it("sorts most recently edited first", () => {
    const a = { id: "a", body: "a", updatedAt: "2026-11-18T10:00:00Z" };
    const b = { id: "b", body: "b", updatedAt: "2026-11-19T10:00:00Z" };
    assert.deepEqual(sortNotes([a, b]).map((n) => n.id), ["b", "a"]);
  });
});

describe("loadNotes / saveNotes", () => {
  it("round-trips through the store", () => {
    const s = store();
    saveNotes(s, [createNote("hello"), createNote("world")]);
    const loaded = loadNotes(s);
    assert.equal(loaded.length, 2);
    assert.equal(loaded[0].body, "hello");
  });

  it("a corrupt stored value means 'no notes', not a crash", () => {
    const s = store();
    s.setItem("patchwork.notes.v1", "{not json");
    assert.deepEqual(loadNotes(s), []);
    s.setItem("patchwork.notes.v1", JSON.stringify({ not: "an array" }));
    assert.deepEqual(loadNotes(s), []);
    s.setItem("patchwork.notes.v1", JSON.stringify([{ id: 1 }, { id: "x", body: "ok" }]));
    assert.deepEqual(loadNotes(s).map((n) => n.id), ["x"]);
  });
});
