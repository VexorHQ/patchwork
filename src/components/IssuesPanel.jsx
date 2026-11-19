export default function IssuesPanel({ repoInput, onRepoInput, onWatch, issues, loading, error, onRefresh }) {
  return (
    <section className="panel issues-panel" aria-label="GitHub issues">
      <div className="panel-label">GitHub issues</div>
      <form
        className="repo-picker"
        onSubmit={(e) => {
          e.preventDefault();
          onWatch();
        }}
      >
        <input
          value={repoInput}
          onChange={(e) => onRepoInput(e.target.value)}
          placeholder="owner/name — for example facebook/react"
          aria-label="Repository to watch"
        />
        <button type="submit">Watch</button>
        <button type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {!error && issues.length === 0 && !loading && (
        <p className="empty">No open issues here — or no repository watched yet. Type one above.</p>
      )}
      <ul className="issue-list">
        {issues.map((issue) => (
          <li key={issue.number}>
            <a href={issue.url} target="_blank" rel="noreferrer">
              <span className="issue-number">#{issue.number}</span> {issue.title}
            </a>
            <span className="issue-meta">
              {issue.ageDays === 0 ? "opened today" : `open ${issue.ageDays} day${issue.ageDays === 1 ? "" : "s"}`}
              {issue.labels.map((label) => (
                <span key={label} className="label">{label}</span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
