import fs from 'node:fs';
import path from 'node:path';

export function compareHistory(records = []) {
  const sorted = records.filter((r) => r && typeof r.timestamp === 'string' && r.commitSha).sort((a,b) => Date.parse(b.timestamp)-Date.parse(a.timestamp)).slice(0,20);
  if (sorted.length < 2) return { available: false, reason: 'At least two verified records are required for comparison.', records: sorted, changes: [] };
  const [latest, previous] = sorted;
  const changes = [];
  const metrics = ['testFailures','bundleBytes','lighthousePerformance','accessibilityFindings','workflowDurationMs'];
  for (const metric of metrics) {
    const a = latest.metrics?.[metric], b = previous.metrics?.[metric];
    if (Number.isFinite(a) && Number.isFinite(b)) changes.push({ metric, previous: b, latest: a, delta: a-b, direction: a===b?'unchanged':(metric==='lighthousePerformance' ? (a>b?'improved':'regressed') : (a<b?'improved':'regressed')) });
  }
  return { available: true, latest, previous, records: sorted, changes };
}
const source = 'public/data/quality-history.json';
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/compare-quality-history.mjs')) {
  const data = JSON.parse(fs.readFileSync(source,'utf8'));
  const result = compareHistory(data.records || []);
  console.log(result.available ? `Compared ${result.latest.commitSha} with ${result.previous.commitSha}: ${result.changes.length} comparable metrics.` : result.reason);
}
