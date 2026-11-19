// Tests for the Pomodoro state machine.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DURATIONS_MS,
  createTimer,
  ensureToday,
  start,
  pause,
  reset,
  remainingMs,
  tick,
  formatRemaining,
} from "../src/lib/timer.js";

const t0 = new Date("2026-11-19T09:00:00Z");
const at = (ms) => new Date(t0.getTime() + ms);

describe("createTimer / start / pause / remainingMs", () => {
  it("starts in work mode, not running, with a full block left", () => {
    const timer = createTimer(t0);
    assert.equal(timer.mode, "work");
    assert.equal(timer.running, false);
    assert.equal(remainingMs(timer, t0), DURATIONS_MS.work);
  });

  it("start sets the end time; pause keeps what's left; resume continues from there", () => {
    let timer = start(createTimer(t0), t0);
    assert.equal(timer.running, true);
    assert.equal(remainingMs(timer, at(60 * 1000)), DURATIONS_MS.work - 60 * 1000);

    timer = pause(timer, at(60 * 1000));
    assert.equal(timer.running, false);
    assert.equal(remainingMs(timer, at(5 * 60 * 1000)), DURATIONS_MS.work - 60 * 1000);

    timer = start(timer, at(5 * 60 * 1000));
    assert.equal(remainingMs(timer, at(6 * 60 * 1000)), DURATIONS_MS.work - 2 * 60 * 1000);
  });

  it("reset goes back to a fresh work block but keeps today's session count", () => {
    let timer = start(createTimer(t0), t0);
    timer = tick(timer, at(DURATIONS_MS.work + 1000)).state;
    assert.equal(timer.sessionsToday, 1);
    timer = reset(timer, at(DURATIONS_MS.work + 2000));
    assert.equal(timer.mode, "work");
    assert.equal(timer.running, false);
    assert.equal(timer.sessionsToday, 1);
    assert.equal(remainingMs(timer, t0), DURATIONS_MS.work);
  });
});

describe("tick", () => {
  it("a finished work block counts, and the next break is short", () => {
    let timer = start(createTimer(t0), t0);
    const { state, completed } = tick(timer, at(DURATIONS_MS.work + 1000));
    assert.equal(completed, "work");
    assert.equal(state.mode, "shortBreak");
    assert.equal(state.sessionsToday, 1);
    assert.equal(state.running, true);
  });

  it("after four work blocks the break is long", () => {
    let timer = createTimer(t0);
    for (let i = 0; i < 4; i++) {
      timer = start({ ...timer, mode: "work", running: false, pausedRemainingMs: DURATIONS_MS.work }, at(i * 1000));
      const result = tick(timer, at(DURATIONS_MS.work + i * 1000 + 1000));
      timer = result.state;
      if (i < 3) {
        assert.equal(timer.mode, "shortBreak");
        // Finish the break so the next work block can start.
        timer = tick(timer, at(DURATIONS_MS.work + DURATIONS_MS.shortBreak + i * 1000 + 2000)).state;
        assert.equal(timer.mode, "work");
      }
    }
    assert.equal(timer.mode, "longBreak");
    assert.equal(timer.sessionsToday, 4);
  });

  it("a finished break goes back to work", () => {
    let timer = start(createTimer(t0), t0);
    timer = tick(timer, at(DURATIONS_MS.work + 1000)).state;
    assert.equal(timer.mode, "shortBreak");
    const { state, completed } = tick(timer, at(DURATIONS_MS.work + DURATIONS_MS.shortBreak + 2000));
    assert.equal(completed, "break");
    assert.equal(state.mode, "work");
  });

  it("a reload mid-block recovers the remaining time from the clock", () => {
    // The timer was started at t0 and the page reloaded 10 minutes later.
    // The stored state only has endsAt — the remaining time is recomputed.
    const timer = { ...start(createTimer(t0), t0) };
    assert.equal(remainingMs(timer, at(10 * 60 * 1000)), DURATIONS_MS.work - 10 * 60 * 1000);
    // And a block that ended while the page was closed is counted on return.
    const { state, completed } = tick(timer, at(DURATIONS_MS.work + 60 * 1000));
    assert.equal(completed, "work");
    assert.equal(state.sessionsToday, 1);
  });
});

describe("ensureToday", () => {
  it("a new calendar day resets the session count", () => {
    const timer = { ...createTimer(t0), sessionsToday: 3 };
    const nextDay = ensureToday(timer, new Date("2026-11-20T09:00:00Z"));
    assert.equal(nextDay.sessionsToday, 0);
    assert.equal(nextDay.day, "2026-11-20");
    assert.equal(ensureToday(timer, t0).sessionsToday, 3);
  });
});

describe("formatRemaining", () => {
  it("shows minutes and seconds, zero-padded", () => {
    assert.equal(formatRemaining(25 * 60 * 1000), "25:00");
    assert.equal(formatRemaining(5 * 60 * 1000 + 3000), "05:03");
    assert.equal(formatRemaining(0), "00:00");
  });
});
