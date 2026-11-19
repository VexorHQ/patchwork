import { MODE_LABELS, formatRemaining } from "../lib/timer.js";

export default function TimerPanel({ timer, remainingMs, notice, onStart, onPause, onReset }) {
  return (
    <section className="panel timer-panel" aria-label="Pomodoro timer">
      <div className="panel-label">Pomodoro</div>
      <div className="timer-mode">{MODE_LABELS[timer.mode]}</div>
      <div className="timer-time">{formatRemaining(remainingMs)}</div>
      {notice && <p className="timer-notice">{notice}</p>}
      <div className="timer-buttons">
        {timer.running ? (
          <button onClick={onPause}>Pause</button>
        ) : (
          <button onClick={onStart}>Start</button>
        )}
        <button onClick={onReset}>Reset</button>
      </div>
      <p className="timer-sessions">
        {timer.sessionsToday} work block{timer.sessionsToday === 1 ? "" : "s"} done today
        {timer.sessionsToday > 0 && timer.sessionsToday % 4 === 0
          ? " — nice, that's four"
          : ""}
      </p>
    </section>
  );
}
