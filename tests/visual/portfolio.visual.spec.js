const { test, expect } = require('@playwright/test');
const pages = [
  ['home', '/'],
  ['project-detail', '/projects/portfolio-website/'],
  ['engineering', '/engineering/'],
  ['quality-center', '/engineering/quality/'],
  ['benchmark-lab', '/engineering/benchmarks/'],
  ['api-contract-playground', '/engineering/api-lab/'],
  ['system-design', '/engineering/system-design/']
];
for (const [name, route] of pages) {
  test(`${name} visual baseline`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts?.ready);
    await page.addStyleTag({ content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; caret-color: transparent !important; }` });
    await expect(page.locator('body')).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.015 });
  });
}
