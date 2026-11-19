import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NotesPanel from "./components/NotesPanel.jsx";
import IssuesPanel from "./components/IssuesPanel.jsx";
import TimerPanel from "./components/TimerPanel.jsx";
import BriefingPanel from "./components/BriefingPanel.jsx";
import { createNote, loadNotes, saveNotes, sortNotes, touchNote, NOTES_KEY } from "./lib/notes.js";
import { fetchIssues, parseRepo, REPO_KEY } from "./lib/github.js";
import { buildBriefing } from "./lib/briefing.js";
import {
  createTimer,
  ensureToday,
  pause as pauseTimer,
  remainingMs,
  reset as resetTimer,
  start as startTimer,
  tick as tickTimer,
} from "./lib/timer.js";

const TIMER_KEY = "patchwork.timer.v1";
const ACTIVE_NOTE_KEY = "patchwork.active-note.v1";

function loadJson(store, key, fallback) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(store, key, value) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the app keeps working in memory for this session.
  }
}

export default function App() {
  const store = typeof window !== "undefined" ? window.localStorage : null;

  const [notes, setNotes] = useState(() => (store ? loadNotes(store) : []));
  const [activeNoteId, setActiveNoteId] = useState(() =>
    store ? store.getItem(ACTIVE_NOTE_KEY) : null
  );
  const [repoInput, setRepoInput] = useState(() =>
    store ? store.getItem(REPO_KEY) || "facebook/react" : "facebook/react"
  );
  const [repo, setRepo] = useState(() => {
    const parsed = parseRepo(store ? store.getItem(REPO_KEY) || "facebook/react" : "facebook/react");
    return parsed.error ? { owner: "facebook", repo: "react" } : parsed;
  });
  const [issues, setIssues] = useState([]);
  const [issuesError, setIssuesError] = useState(null);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [timer, setTimer] = useState(() =>
    store ? ensureToday(loadJson(store, TIMER_KEY, createTimer()), new Date()) : createTimer()
  );
  const [notice, setNotice] = useState(null);
  const [now, setNow] = useState(() => new Date());

  const loadIssues = useCallback(async (owner, repoName) => {
    setIssuesLoading(true);
    setIssuesError(null);
    const result = await fetchIssues(owner, repoName);
    if (result.ok) {
      setIssues(result.issues);
    } else {
      // Keep the last good list on screen; only the message changes.
      setIssuesError(result.error);
    }
    setIssuesLoading(false);
  }, []);

  // Fetch issues when the watched repo changes (and on first load).
  useEffect(() => {
    loadIssues(repo.owner, repo.repo);
  }, [repo, loadIssues]);

  // Notes save themselves, 500ms after the last keystroke.
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!store) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNotes(store, notes), 500);
    return () => clearTimeout(saveTimer.current);
  }, [notes, store]);

  useEffect(() => {
    if (!store) return;
    saveJson(store, TIMER_KEY, timer);
  }, [timer, store]);

  useEffect(() => {
    if (!store) return;
    if (activeNoteId) store.setItem(ACTIVE_NOTE_KEY, activeNoteId);
  }, [activeNoteId, store]);

  // The timer ticks once a second. When a block ends, the panel says so.
  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date();
      setNow(t);
      setTimer((prev) => {
        const { state, completed } = tickTimer(prev, t);
        if (completed === "work") {
          setNotice("Work block done — take five minutes. The break has started.");
        } else if (completed === "break") {
          setNotice("Break over — back to work when you're ready.");
        }
        return state;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const briefing = useMemo(
    () => buildBriefing({ notes, issues, sessionsToday: timer.sessionsToday, now }),
    [notes, issues, timer.sessionsToday, now]
  );

  const remaining = remainingMs(timer, now);

  const handleNoteChange = (id, body) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? touchNote(n, body) : n)));
  };

  const handleNewNote = () => {
    const note = createNote();
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
  };

  const handleDeleteNote = (id) => {
    const note = notes.find((n) => n.id === id);
    const title = note ? note.body.split("\n")[0] || "Untitled note" : "this note";
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setNotes((prev) => {
      const rest = prev.filter((n) => n.id !== id);
      if (id === activeNoteId) {
        const sorted = sortNotes(rest);
        setActiveNoteId(sorted[0]?.id || null);
      }
      return rest;
    });
  };

  const handleWatch = () => {
    const parsed = parseRepo(repoInput);
    if (parsed.error) {
      setIssuesError(parsed.error);
      return;
    }
    if (store) store.setItem(REPO_KEY, `${parsed.owner}/${parsed.repo}`);
    setRepo(parsed);
  };

  return (
    <div className="app">
      <header>
        <h1>Patchwork</h1>
        <p>Four tools that don&apos;t belong together, stitched into one workday.</p>
      </header>
      <main className="grid">
        <BriefingPanel briefing={briefing} />
        <TimerPanel
          timer={timer}
          remainingMs={remaining}
          notice={notice}
          onStart={() => { setNotice(null); setTimer((t) => startTimer(t, new Date())); }}
          onPause={() => setTimer((t) => pauseTimer(t, new Date()))}
          onReset={() => { setNotice(null); setTimer((t) => resetTimer(t, new Date())); }}
        />
        <NotesPanel
          notes={notes}
          activeNoteId={activeNoteId}
          onSelect={setActiveNoteId}
          onChange={handleNoteChange}
          onNew={handleNewNote}
          onDelete={handleDeleteNote}
        />
        <IssuesPanel
          repoInput={repoInput}
          onRepoInput={setRepoInput}
          onWatch={handleWatch}
          issues={issues}
          loading={issuesLoading}
          error={issuesError}
          onRefresh={() => loadIssues(repo.owner, repo.repo)}
        />
      </main>
      <footer>
        <p>
          Your notes and timer live in this browser only — nothing is sent
          anywhere. Issues come from GitHub&apos;s public API, no login needed.
        </p>
      </footer>
    </div>
  );
}
