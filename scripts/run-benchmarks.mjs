import fs from 'node:fs';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

// Deterministic local scenarios: compare repeated linear lookup with indexed lookup on the same generated dataset.
export function runBenchmarks({ samples = 15, warmups = 3, size = 5000 } = {}) {
  if (!Number.isInteger(samples) || samples < 1 || samples > 1000) throw new Error('samples must be an integer from 1 to 1000');
  if (!Number.isInteger(warmups) || warmups < 0 || warmups > 100) throw new Error('warmups must be an integer from 0 to 100');
  if (!Number.isInteger(size) || size < 100 || size > 100000) throw new Error('size must be an integer from 100 to 100000');
  const data = Array.from({ length: size }, (_, id) => ({ id, value: `item-${id}` }));
  const index = new Map(data.map((item) => [item.id, item]));
  const setupSamples = [];
  for (let i = 0; i < samples; i++) { const start = performance.now(); new Map(data.map((item) => [item.id, item])); setupSamples.push(performance.now() - start); }
  setupSamples.sort((a,b)=>a-b);
  const mapSetupMedianMs = Number(setupSamples[Math.floor((setupSamples.length - 1) / 2)].toFixed(4));
  const targets = Array.from({ length: Math.min(size, 1000) }, (_, i) => (i * 37) % size);
  const scenarios = [
    { id: 'linear-lookup', label: 'Baseline: linear lookup', implementation: 'Array.find over deterministic in-memory records', run: () => { let n = 0; for (const id of targets) if (data.find((x) => x.id === id)) n++; return n; } },
    { id: 'indexed-lookup', label: 'Optimized: Map lookup', implementation: 'Map.get over the same deterministic records', run: () => { let n = 0; for (const id of targets) if (index.get(id)) n++; return n; } }
  ];
  const results = scenarios.map((s) => {
    for (let i = 0; i < warmups; i++) s.run();
    const durations = [];
    for (let i = 0; i < samples; i++) { const start = performance.now(); s.run(); durations.push(performance.now() - start); }
    durations.sort((a, b) => a - b);
    const percentile = (p) => durations[Math.min(durations.length - 1, Math.ceil(p * durations.length) - 1)];
    return { id: s.id, label: s.label, implementation: s.implementation, scenario: 'Lookup up to 1000 deterministic integer IDs in one in-memory dataset', datasetSize: size, operationsPerSample: targets.length, unit: 'ms', medianMs: Number(percentile(.5).toFixed(4)), p95Ms: Number(percentile(.95).toFixed(4)), sampleCount: samples, warmupCount: warmups, setupMedianMs: s.id === 'indexed-lookup' ? mapSetupMedianMs : 0, perOperationMedianMs: Number((percentile(.5) / targets.length).toFixed(8)), memoryBytes: process.memoryUsage().heapUsed, measuredAt: new Date().toISOString() };
  });
  const byId = Object.fromEntries(results.map(r => [r.id, r]));
  const delta = byId['linear-lookup'].perOperationMedianMs - byId['indexed-lookup'].perOperationMedianMs;
  const breakEven = delta > 0 ? { status: 'estimated', operations: Math.ceil(byId['indexed-lookup'].setupMedianMs / delta), mapSetupMedianMs: byId['indexed-lookup'].setupMedianMs, arrayPerOperationMedianMs: byId['linear-lookup'].perOperationMedianMs, mapPerOperationMedianMs: byId['indexed-lookup'].perOperationMedianMs, note: 'Approximate estimate from this run; compare only on the same host/runtime.' } : { status: 'unavailable', reason: 'No measured per-operation advantage for Map in this run.' };
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), commitSha: process.env.GITHUB_SHA || null, environment: { runtime: process.version, platform: `${os.platform()} ${os.arch()}`, cpu: os.cpus()?.[0]?.model || 'not reported', hardware: 'Current local/CI host; values are environment-specific', notes: 'Microbenchmark only; not a browser field measurement or production capacity test.' }, breakEven, methodology: { clock: 'node:perf_hooks performance.now()', warmupPolicy: `${warmups} unreported warm-up runs per scenario`, sampleCount: samples, datasetSize: size, limitations: 'JIT, CPU load, runtime version and host affect results. Map setup is sampled independently; per-operation cost is median duration divided by operations. Approximate break-even uses these medians and is not a production guarantee.' }, results };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = runBenchmarks({ samples: Number(process.env.BENCH_SAMPLES || 15), warmups: Number(process.env.BENCH_WARMUPS || 3), size: Number(process.env.BENCH_SIZE || 5000) });
  fs.mkdirSync('public/data', { recursive: true }); fs.writeFileSync('public/data/benchmarks.json', JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${out.results.length} measured scenarios to public/data/benchmarks.json (${out.commitSha || 'local commit unknown'}).`);
}
