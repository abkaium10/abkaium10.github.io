const base = process.env.LHCI_BASE_URL || 'http://127.0.0.1:4173';
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run serve:static',
      startServerReadyPattern: 'http://127.0.0.1:4173',
      url: ['/', '/projects/portfolio-website/', '/engineering/', '/engineering/quality/', '/engineering/benchmarks/', '/engineering/api-lab/'].map((p) => `${base}${prefix}${p}`),
      numberOfRuns: 2,
      settings: { preset: 'desktop', throttlingMethod: 'simulate', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }
    },
    assert: { preset: 'lighthouse:recommended', assertions: { 'categories:performance': ['warn', { minScore: 0.75 }], 'categories:accessibility': ['warn', { minScore: 0.85 }], 'categories:best-practices': ['warn', { minScore: 0.8 }], 'categories:seo': ['warn', { minScore: 0.8 }], 'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }], 'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }], 'total-blocking-time': ['warn', { maxNumericValue: 400 }] } },
    upload: { target: 'filesystem', outputDir: './artifacts/lighthouse' }
  }
};
