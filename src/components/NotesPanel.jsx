import { marked } from "marked";
import { noteTitle, sortNotes } from "../lib/notes.js";

// Notes are rendered as markdown. Raw HTML typed into a note is passed
// through by marked, so a note can contain HTML — but a note is only ever
// shown to the person who wrote it, on their own machine, so there is nobody
// else to attack. (If this ever becomes a shared app, sanitise here.)
const renderMarkdown = (body) => marked.parse(body || "");

export default function NotesPanel({ notes, activeNoteId, onSelect, onChange, onNew, onDelete }) {
  const sorted = sortNotes(notes);
  const active = notes.find((n) => n.id === activeNoteId) || null;

  return (
    <section className="panel notes-panel" aria-label="Notes">
      <div className="panel-label">Notes</div>
      <div className="notes-body">
        <div className="notes-list">
          <button className="new-note" onClick={onNew}>+ New note</button>
          {sorted.length === 0 && (
            <p className="empty">No notes yet. Write your first one — it saves itself as you type.</p>
          )}
          {sorted.map((note) => (
            <button
              key={note.id}
              className={note.id === activeNoteId ? "note-item active" : "note-item"}
              onClick={() => onSelect(note.id)}
            >
              <span className="note-title">{noteTitle(note)}</span>
              <span className="note-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
        <div className="notes-editor">
          {active ? (
            <>
              <div className="notes-toolbar">
                <span className="note-title">{noteTitle(active)}</span>
                <button className="danger" onClick={() => onDelete(active.id)}>Delete</button>
              </div>
              <textarea
                value={active.body}
                onChange={(e) => onChange(active.id, e.target.value)}
                placeholder="Write in markdown. Headings, lists, code — it all renders on the right."
                aria-label="Note editor"
              />
              <div
                className="notes-preview"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(active.body) }}
              />
            </>
          ) : (
            <p className="empty">Pick a note on the left, or start a new one.</p>
          )}
        </div>
      </div>
    </section>
  );
}
