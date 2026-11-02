# Handover: Impact Financing Framework v2

Status as of November 2, 2026: v2 is built, browser-tested and committed on the `v2` branch of the local repo.
It is not yet deployed. What remains is Steve's copy review, the CHAI and license decision, pushing the branch,
reviewing the Netlify deploy preview and merging. The plan this round followed is in `docs/IMPLEMENTATION-PLAN.md`.

## What changed from v1
| Area | v1 | v2 |
| --- | --- | --- |
| Rendering | One `index.html`, React and Babel compiled in the browser, Tailwind Play CDN, unpinned unpkg scripts. Crawlers saw only meta tags. | Astro static build: every route is pre-rendered HTML with its full text. Pinned dependencies, no client framework, no third-party requests (fonts are self-hosted). |
| URLs | One page, tabs in state, back button left the site | Real routes for every page, section anchors, sitemap, robots, canonical, Open Graph image, structured data; old `/#anchor` links forward to their new pages |
| Weight | ~34.5 MB of PNG illustrations | A typical page transfers 100 to 140 KB in total (fonts, CSS, HTML and lazy-loaded illustrations) |
| Objective | Implicit | Explicit: durable impact per concessional dollar, written as a ratio, with a worked example and calculator |
| Content | Strong mechanism layer; several inaccurate examples; binary with a third category | Mechanism layer kept and extended; examples corrected and sourced; binary sharpened (see CONTENT-DECISIONS.md) |
| Jargon | A tooltip component that was never used | Inline definitions on first use of key terms, drawn from the glossary |
| Diagnostic | Two questions, second ignored | Six-step worksheet producing a dated, printable brief with flags and an optional back-of-envelope ratio |
| Instruments | 36 entries with invented percentage scores | 21 entries: role, levers, money, durability condition, strengths, limitations |
| Look | Inter + Playfair, slate/blue/emerald, landscape illustrations | Same design language, same illustrations (watermark removed, outdated titles cropped) |

## Routes
`/`, `/foundations/`, `/framework/`, `/framework/mechanisms/`, `/framework/payers/`, `/cost-effectiveness/`,
`/cases/` (+ `implants`, `tld`, `pneumococcal-amc`, `frontier`, `bc-carbon-tax`), `/instruments/`, `/diagnostic/`,
`/glossary/`, `/questions/`, `/related-work/`, `/about/`, `/404.html`.

## QA completed (November 2, 2026)
- Browser pass at 375, 768 and 1280 px on every route: no horizontal overflow, no console errors. Fixed: grey legend
  swatches, prose styles leaking into cards, oversized figure labels on desktop and unreadable ones on phones, a truncated
  contents label, squeezed number badges, unstyled `h2`s, the printed brief's padding, and low-contrast text.
- Lighthouse 12, mobile, every route: performance 99 to 100, accessibility 100, best practices 100, SEO 100.
- `node scripts/check-content.mjs` passes (see CLAUDE.md for what it covers).
- Diagnostic tested end to end: answers persist in the browser, each diagnosis branch, flags, ratio range, print view.

## Decisions made
1. **Orientation.** Valleys kept (low ground = profitable), matching the illustrations and the water metaphor. The home
   page now says so in one sentence.
2. **Feedback.** GitHub issues only, as on the About page.
3. **Scope.** Built the worked example and calculator, the diagnostic ratio step, inline definitions and four restored
   instruments (offtake agreements, tiered pricing, priority review vouchers, voluntary carbon credits).

## Decisions still with Steve
1. **CHAI and licensing.** Confirm CHAI is comfortable with publication, and with CC BY 4.0, which permits commercial
   reuse. The About page states the work is in a personal capacity. A skim of the CHAI market shaping framework (October
   2024) suggests little structural overlap: it is organized by value-chain barrier, the IFF by landscapes, levers and
   payers. v1's `.gitignore` published the private filenames on GitHub; the v2 branch removes them from the current file,
   but they remain in the history of `main`.
2. **Voice pass.** New and reworked sections (Cost-Effectiveness including the worked example, Payers, wedge geometry,
   cases, the restored instruments) need Steve's read, especially claims drawn from practitioner knowledge (flagged in
   FACT-CHECK.md as "A").
3. **Version label.** The site says "2.0 (draft)". Change `version` in `src/data/site.js` and the About page when ready.

## Remaining tasks, in priority order
- [ ] Steve's copy review and the CHAI/license decision.
- [ ] Push the branch: `git push -u origin v2`. Netlify builds a deploy preview from `netlify.toml`
      (build `npm run build`, publish `dist`, Node 22). Check the preview, including response headers (CSP).
- [ ] Merge `v2` into `main`, confirm the production deploy.
- [ ] Submit `https://impactfinancingframework.org/sitemap-index.xml` in Google Search Console, and check the link
      preview with LinkedIn's Post Inspector.
- [ ] Optional: privacy-friendly analytics, dark mode, upgrade to Astro 6 or later.
- [ ] Next cases to research and source: novel antibiotics (subscription payments), the Rikers Island social impact bond,
      Spain's feed-in tariff cuts.

## Acceptance criteria
- Every route returns pre-rendered HTML containing its full text; `node scripts/check-content.mjs` passes.
- No third-party JavaScript or fonts; inline scripts only on home (anchor redirects), instruments, glossary,
  cost-effectiveness and diagnostic pages.
- No image over 100 KB; all illustrations lazy-loaded with width and height set.
- Lighthouse 95+ on mobile across categories.
- Every number on the site is logged with a source in FACT-CHECK.md, or labeled and logged as illustrative.
