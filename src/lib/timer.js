// The Pomodoro timer as a small state machine.
//
// State: { mode, running, endsAt, pausedRemainingMs, sessionsToday, day }.
// `endsAt` is an epoch ms timestamp, so a reload mid-block recovers the
// remaining time from the clock instead of restarting. When a block ends, the
// timer moves to the next mode and keeps running — the panel says what
// happened, and the user can pause any time.

import { todayKey } from "./dates.js";

export const DURATIONS_MS = {
  work: 25 * 60 * 1000,
  shortBreak: 5 * 60 * 1000,
  longBreak: 15 * 60 * 1000,
};

export const MODE_LABELS = {
  work: "Work",
  shortBreak: "Short break",
  longBreak: "Long break",
};

export function createTimer(now = new Date()) {
  return {
    mode: "work",
    running: false,
    endsAt: null,
    pausedRemainingMs: DURATIONS_MS.work,
    sessionsToday: 0,
    day: todayKey(now),
  };
}

// A new calendar day resets the session count.
export function ensureToday(state, now = new Date()) {
  const day = todayKey(now);
  if (state.day === day) return state;
  return { ...state, day, sessionsToday: 0 };
}

export function start(state, now = new Date()) {
  const t = new Date(now).getTime();
  const remaining = state.pausedRemainingMs ?? DURATIONS_MS[state.mode];
  return { ...state, running: true, endsAt: t + remaining, pausedRemainingMs: null };
}

export function pause(state, now = new Date()) {
  if (!state.running) return state;
  const remaining = Math.max(0, (state.endsAt ?? 0) - new Date(now).getTime());
  return { ...state, running: false, endsAt: null, pausedRemainingMs: remaining };
}

export function reset(state, now = new Date()) {
  return { ...ensureToday(state, now), mode: "work", running: false, endsAt: null, pausedRemainingMs: DURATIONS_MS.work };
}

export function remainingMs(state, now = new Date()) {
  if (state.running && state.endsAt) {
    return Math.max(0, state.endsAt - new Date(now).getTime());
  }
  return state.pausedRemainingMs ?? DURATIONS_MS[state.mode];
}

// Advance the clock by one step. Returns { state, completed } where
// completed is "work" or "break" when a block just ended, else null.
// A finished work block counts toward today; after every fourth one the
// next break is long instead of short.
export function tick(state, now = new Date()) {
  const s = ensureToday(state, now);
  if (!s.running || !s.endsAt) return { state: s, completed: null };
  const t = new Date(now).getTime();
  if (t < s.endsAt) return { state: s, completed: null };

  if (s.mode === "work") {
    const sessionsToday = s.sessionsToday + 1;
    const nextMode = sessionsToday % 4 === 0 ? "longBreak" : "shortBreak";
    return {
      state: { ...s, mode: nextMode, sessionsToday, running: true, endsAt: t + DURATIONS_MS[nextMode], pausedRemainingMs: null },
      completed: "work",
    };
  }
  return {
    state: { ...s, mode: "work", running: true, endsAt: t + DURATIONS_MS.work, pausedRemainingMs: null },
    completed: "break",
  };
}

export function formatRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
