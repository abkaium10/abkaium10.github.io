export default function QualityHistory({ history, security }) {
  const records = Array.isArray(history?.records) ? history.records.slice(0, 20) : [];
  const findings = Array.isArray(security?.findings) ? security.findings : [];
  return <section className="ec" aria-labelledby="quality-history-title" style={{ marginTop: 18 }}>
    <h2 id="quality-history-title" style={{ fontSize: '1.45rem' }}>Quality history &amp; security signals</h2>
    <p className="mu">CI history is append-only per verified commit in the published static report. Missing metrics are not treated as zero.</p>
    {records.length < 2 ? <p className="mu">Historical regression comparison unavailable: {records.length === 0 ? 'no verified CI history has been published yet.' : 'only one verified record exists; a second is required for comparison.'}</p> : <ol>{records.slice(0, 5).map((r) => <li key={r.commitSha} style={{ margin: '10px 0' }}><code>{r.commitSha.slice(0, 8)}</code> · {r.timestamp} · {r.workflowRun ? <a href={r.workflowRun} rel="noreferrer">CI run</a> : 'CI URL unavailable'}</li>)}</ol>}
    <p><strong>Security heuristic report:</strong> {security?.generatedAt ? `generated ${security.generatedAt}` : 'not generated'} · {findings.length} finding(s) recorded.</p>
    <p className="mu">This lightweight scan is not a full secret scan, dependency audit, SBOM, or security certification. See security documentation in the source repository.</p>
  </section>;
}
