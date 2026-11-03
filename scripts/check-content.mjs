// Post-build QA for dist/. Run after `npm run build`; exits non-zero if anything fails.
// Pages: one h1, no skipped heading levels, title, meta description, canonical, valid JSON-LD, no placeholder text, internal links and
// #anchors resolve, no external scripts, every <img> has width and height.
// Assets: no image over 100 KB. Sources: no unquoted comma in front-matter contents labels (YAML splits them).
// Content: the worked example's arithmetic on the Cost-Effectiveness page and the implants retrospective match their inputs.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };
const all = walk(DIST);

let problems = 0;
const warn = (m) => { problems++; console.log('  x ' + m); };

const pages = new Map();
for (const f of all.filter((p) => p.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8');
  const route = '/' + relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  pages.set(route, { html, ids });
}

for (const [route, { html }] of pages) {
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<span class="term-def"[\s\S]*?<\/span><\/span>/g, '</span>').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  console.log(`${route.padEnd(30)} ${String(words).padStart(5)} words  ${(Buffer.byteLength(html) / 1024).toFixed(0).padStart(4)} KB`);
  if (h1 !== 1) warn(`${route}: ${h1} h1 elements`);
  if (!title) warn(`${route}: missing <title>`);
  if (!desc || desc.length < 50) warn(`${route}: missing or short meta description`);
  if (!/<link rel="canonical" href="https:\/\/impactfinancingframework\.org\//.test(html)) warn(`${route}: missing canonical URL`);
  if (/\b(TODO|TBD|lorem ipsum|FIXME)\b/i.test(text)) warn(`${route}: placeholder text`);
  if (/<script[^>]+src="(https?:)?\/\//.test(html)) warn(`${route}: external script`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { warn(`${route}: invalid JSON-LD`); }
  }
  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] || '';
  const levels = [...main.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  levels.forEach((l, i) => { if (i && l > levels[i - 1] + 1) warn(`${route}: heading level jumps from h${levels[i - 1]} to h${l}`); });
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\swidth="\d+"/.test(m[0]) || !/\sheight="\d+"/.test(m[0])) warn(`${route}: <img> without width and height`);
  }
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1];
    if (href.startsWith('/_astro/') || /\.(svg|png|webp|xml|txt|ico|woff2)$/.test(href.split('#')[0])) continue;
    const [path, hash] = href.split('#');
    const target = pages.get(path) || pages.get(path + '/');
    if (!target) { warn(`${route}: broken link ${href}`); continue; }
    if (hash && !target.ids.has(hash)) warn(`${route}: missing anchor ${href}`);
  }
}

for (const f of all.filter((p) => ['.png', '.webp', '.jpg', '.jpeg', '.avif', '.gif'].includes(extname(p)))) {
  const kb = statSync(f).size / 1024;
  if (kb > 100) warn(`${relative(DIST, f)}: image is ${kb.toFixed(0)} KB (limit 100 KB)`);
}

for (const f of walk(join(ROOT, 'src/pages')).filter((p) => p.endsWith('.mdx'))) {
  const fm = readFileSync(f, 'utf8').split('---')[1] || '';
  for (const line of fm.split('\n')) {
    if (/label:\s*[^'"\s{][^}]*,[^}]*\}/.test(line)) warn(`${relative(ROOT, f)}: unquoted comma in front-matter label: ${line.trim()}`);
  }
}

// Worked example on /cost-effectiveness/: recompute the ratios from the stated inputs.
{
  const html = pages.get('/cost-effectiveness/')?.html || '';
  const size = 30e6, cost = 5e6, collapse = 0.7, co = 4e6, rep = 10e6;
  const value = (treat) => 0.8 * treat + 0.2 * 1;
  const impact = (years, treat = 2) => size * years * 0.75 * value(treat);
  const contrib = (years, treat = 2, q = collapse) => q * (impact(years, treat) - co) + (1 - q) * rep;
  const expect = {
    naive: (size * 10 * 2) / cost, honest: contrib(3) / cost, low: contrib(1) / cost, high: contrib(7) / cost,
    cheap: contrib(3, 0.5) / cost, rich: contrib(3, 4) / cost, replaced: contrib(3, 2, 0) / cost,
  };
  const shown = {
    naive: ['120x the benchmark', 120], honest: ['17x the benchmark', 17], low: ['falls to about 6x', 6], high: ['rises to about 40x', 40],
    cheap: ['also fall to about 6x', 6], rich: ['rise to about 32x', 32], replaced: ['the ratio to 2x', 2],
  };
  for (const k of Object.keys(expect)) {
    const [text, n] = shown[k];
    if (Math.abs(n - expect[k]) > 0.5) warn(`worked example: ${k} shown as ${n}, computes to ${expect[k].toFixed(2)}`);
    if (!html.includes(text)) warn(`worked example: "${text}" not found on /cost-effectiveness/`);
  }
  if (Math.abs(impact(3) - 121.5e6) > 1) warn('worked example: durable impact is not $121.5 million');
  if (Math.abs(contrib(3) - 85.25e6) > 1) warn('worked example: contribution is not $85.25 million');
  if (Math.abs(0.15 * 0.5 * 20e6 + 1e6 + 2.5e6 - cost) > 1) warn('worked example: expected cost components do not sum to $5 million');
}

// Implants retrospective on /cases/implants/: recompute the break-even table from the stated inputs.
{
  const html = pages.get('/cases/implants/')?.html || '';
  const V = { 2013: 6.1, 2014: 6.2, 2015: 10.2, 2016: 9.157, 2017: 8.251, 2018: 10.570, 2019: 11.233, 2020: 13.667 }; // millions
  const P0 = 18, DEAL = 8.5, B2012 = 5.8 * (17.92 + 18.05) / 2; // $ millions in 2012
  const perImplant = 3.1 * 0.6 * 0.7 - 30 * 0.007, perDollar = 0.007, BENCH = 0.0033, BAR = 6;
  const path = (rate, endTrend, conv) => (y) => {
    const trend = (t) => P0 * (1 - rate) ** (t - 2012);
    if (y <= endTrend) return Math.max(trend(y), DEAL);
    if (y >= conv) return DEAL;
    const p0 = trend(endTrend);
    return p0 - (p0 - DEAL) * (y - endTrend) / (conv - endTrend);
  };
  const paths = { fast: path(0.09, 2016, 2017), central: path(0.08, 2017, 2018), slow: path(0.04, 2017, 2021) };
  const run = (price, budget) => {
    let gross = 0, uov = 0;
    for (const [ys, v] of Object.entries(V)) {
      const p = price(+ys); if (p <= DEAL) continue;
      const gap = p - DEAL; gross += v * gap;
      const vcf = budget === 'rises' ? v : budget === 'holds' ? Math.min(v, B2012 / p) : Math.min(v, (B2012 + v * p) / 2 / p);
      const extra = v - vcf, released = vcf * gap - DEAL * extra;
      uov += extra * perImplant + released * perDollar;
    }
    return { gross, uov, breakEven: uov / (BAR * BENCH), at25: uov / 25 / BENCH };
  };
  const round10 = (x) => Math.round(x / 10) * 10;
  const table = { rises: [60, 80, 140], midway: [140, 170, 530], holds: [220, 270, 910] };
  const at25 = [];
  for (const [budget, row] of Object.entries(table)) {
    Object.keys(paths).forEach((k, i) => {
      const r = run(paths[k], budget); at25.push(r.at25);
      if (round10(r.breakEven) !== row[i]) warn(`implants retrospective: ${budget}/${k} shown as $${row[i]} million, computes to $${r.breakEven.toFixed(0)} million`);
      if (!html.includes(`$${row[i]} million`)) warn(`implants retrospective: "$${row[i]} million" not found on /cases/implants/`);
    });
  }
  const c = run(paths.central, 'midway');
  if (Math.abs(c.uov - 3.4) > 0.05) warn(`implants retrospective: central impact computes to ${c.uov.toFixed(2)} million units`);
  if (Math.abs(c.uov / BENCH / 1000 - 1) > 0.1) warn('implants retrospective: central impact is not about $1 billion at the benchmark');
  if (Math.abs(c.at25 - 40) > 2) warn(`implants retrospective: central multiple at $25 million computes to ${c.at25.toFixed(1)}`);
  if (Math.abs(Math.min(...at25) - 15) > 1 || Math.abs(Math.max(...at25) - 220) > 2) warn('implants retrospective: range at $25 million is not about 15x to 220x');
  const gross = ['fast', 'central', 'slow'].map((k) => run(paths[k], 'rises').gross);
  [175, 215, 400].forEach((g, i) => { if (Math.abs(gross[i] - g) > 5) warn(`implants retrospective: price advantage ${g} computes to ${gross[i].toFixed(0)}`); });
  for (const t of ['3.4 million units of value', 'about 40x the benchmark', 'about 15x to 220x', 'about $175 million, $215 million and $400 million']) {
    if (!html.includes(t)) warn(`implants retrospective: "${t}" not found on /cases/implants/`);
  }
  const ce = pages.get('/cost-effectiveness/')?.html || '';
  for (const t of ['$175 million to $400 million', 'about 3.4 million units of value', 'about $60 million', 'about 40x']) {
    if (!ce.includes(t)) warn(`retrospective summary: "${t}" not found on /cost-effectiveness/`);
  }
}

console.log(problems ? `\n${problems} problem(s) found.` : '\nAll checks passed.');
process.exit(problems ? 1 : 0);
