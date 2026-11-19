export default function BriefingPanel({ briefing }) {
  if (!briefing) return null;
  return (
    <section className="panel briefing-panel" aria-label="Today briefing">
      <div className="panel-label">Today</div>
      <ul className="briefing-lines">
        <li>
          <strong>{briefing.issueCount}</strong> open issue{briefing.issueCount === 1 ? "" : "s"}
          {briefing.oldestIssue && (
            <span>
              {" "}— oldest is <a href={briefing.oldestIssue.url} target="_blank" rel="noreferrer">#{briefing.oldestIssue.number}</a>, open {briefing.oldestIssue.ageDays} day{briefing.oldestIssue.ageDays === 1 ? "" : "s"}
            </span>
          )}
        </li>
        <li>
          <strong>{briefing.noteCount}</strong> note{briefing.noteCount === 1 ? "" : "s"}
        </li>
        <li>
          <strong>{briefing.sessionsToday}</strong> work block{briefing.sessionsToday === 1 ? "" : "s"} done today
        </li>
      </ul>
      <p className="briefing-suggestion">{briefing.suggestion}</p>
    </section>
  );
}
