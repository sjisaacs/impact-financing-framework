// Post-build QA for dist/. Run after `npm run build`; exits non-zero if anything fails.
// Pages: one h1, no skipped heading levels, title, meta description, canonical, valid JSON-LD, no placeholder text, internal links and
// #anchors resolve, no external scripts, every <img> has width and height.
// Assets: no image over 100 KB. Sources: no unquoted comma in front-matter contents labels (YAML splits them).
// Content: the worked example's arithmetic on the Cost-Effectiveness page matches its inputs.
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
  const size = 30e6, cost = 5e6, honest = (years) => (size * years * 0.8 * 0.75 * 0.5) / cost;
  const expect = { naive: (size * 10) / cost, honest: honest(3), low: honest(1), high: honest(7) };
  const shown = { naive: '60 to 1', honest: '5.4 to 1', low: '1.8 to 1', high: '12.6 to 1' };
  for (const k of Object.keys(expect)) {
    const n = parseFloat(shown[k]);
    if (Math.abs(n - expect[k]) > 0.05) warn(`worked example: ${k} shown as ${n}, computes to ${expect[k].toFixed(2)}`);
    if (!html.includes(shown[k])) warn(`worked example: "${shown[k]}" not found on /cost-effectiveness/`);
  }
  if (Math.abs(0.15 * 0.5 * 20e6 + 1e6 + 2.5e6 - cost) > 1) warn('worked example: expected cost components do not sum to $5 million');
}

console.log(problems ? `\n${problems} problem(s) found.` : '\nAll checks passed.');
process.exit(problems ? 1 : 0);
