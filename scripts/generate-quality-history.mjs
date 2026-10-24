import fs from 'node:fs';
const file = 'public/data/quality-history.json';
const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,'utf8')) : { schemaVersion: 1, records: [] };
const sha = process.env.GITHUB_SHA || null;
const timestamp = new Date().toISOString();
if (!sha) {
  console.log('No GITHUB_SHA supplied; history not changed because this is not a verified CI commit.');
} else {
  const record = { commitSha: sha, timestamp, workflowRun: process.env.GITHUB_RUN_ID && process.env.GITHUB_REPOSITORY ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null, source: 'GitHub Actions workflow', metrics: JSON.parse(process.env.QUALITY_HISTORY_METRICS || '{}'), checks: JSON.parse(process.env.QUALITY_HISTORY_CHECKS || '{}') };
  const records = [record, ...(previous.records || []).filter((r) => r.commitSha !== sha)].slice(0,20);
  fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, generatedAt: timestamp, retention: 'Latest 20 unique CI commits; metrics are omitted unless collected by the workflow.', records }, null, 2)+'\n');
  console.log(`Recorded verified CI metadata for ${sha}; ${records.length} records retained.`);
}
