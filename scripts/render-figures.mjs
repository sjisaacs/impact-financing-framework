// Visual QA for the analytic SVG figures: screenshots every <svg role="img"> on the built site at a given
// viewport width, so label sizes and overlaps can be checked on phones and desktops.
// Usage: npm run build && npx astro preview   (in another terminal)
//        node scripts/render-figures.mjs [baseUrl=http://localhost:4321] [outDir=/tmp/figs] [width=375]
// Needs Playwright with Chromium (npm i -g playwright && npx playwright install chromium); it is not a site dependency.
const [base = 'http://localhost:4321', out = '/tmp/figs', width = '375'] = process.argv.slice(2);
const { mkdirSync, readFileSync } = await import('node:fs');
const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url); // honors NODE_PATH, so a global Playwright install works
let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium'); process.exit(1);
}
const sitemap = readFileSync(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');
const routes = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +width, height: 900 }, deviceScaleFactor: 2 });
const seen = new Set();
for (const r of routes) {
  await page.goto(base + r, { waitUntil: 'networkidle' });
  const svgs = await page.locator('svg[role="img"]').all();
  for (const s of svgs) {
    const id = await s.getAttribute('aria-labelledby');
    const key = (id || 'fig').split(' ')[0];
    if (seen.has(key)) continue; seen.add(key);
    await s.scrollIntoViewIfNeeded();
    await s.screenshot({ path: `${out}/${key}-${width}.png` });
    console.log(`${r} -> ${key}-${width}.png`);
  }
}
await browser.close();
