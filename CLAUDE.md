# Impact Financing Framework, v2

Static site for impactfinancingframework.org: a framework for market shaping and adjacent market and
financial interventions, organized around cost-effectiveness ("durable impact per concessional dollar").
Owner: Steve Isaacs (personal project). Read docs/HANDOVER.md first for status and open decisions.

## Stack and commands
- Astro 5 (static output, pre-rendered HTML, one page per route), MDX for long-form pages.
- Tailwind CSS v3 compiled at build time (config carried over from the v1 single-page site to keep its look).
- Fonts (Inter, Playfair Display) are self-hosted from `@fontsource-variable` packages; no third-party requests at all.
- No client framework. Small inline scripts only: instrument filter, glossary search, diagnostic form, ratio calculator,
  and the v1 anchor redirects on the home page.
- `npm install`, `npm run dev`, `npm run build` (outputs `dist/`), `npm run preview`.
- `node scripts/check-content.mjs` after a build: titles, descriptions, canonical, JSON-LD, one h1 and no skipped heading
  levels, internal links and #anchors, no external scripts, image weight and dimensions, unquoted commas in front-matter
  labels, and the worked example's arithmetic.
- `node scripts/render-figures.mjs http://localhost:4321 /tmp/figs 375` screenshots every SVG figure at a viewport width
  (run `npm run preview` first; needs Playwright installed globally, not as a site dependency). Check 375 and 1280.
- Deploys on Netlify from `main` via `netlify.toml` (build `npm run build`, publish `dist`, Node 22).

## Map
- `src/pages/`: routes. `framework/index.mdx`, `framework/mechanisms.mdx`, `framework/payers.mdx`,
  `cost-effectiveness.mdx`, `foundations.mdx`, `cases/*.mdx`, `instruments.astro`, `diagnostic.astro`, `glossary.astro`.
- `src/components/figures/`: analytic SVG figures (inline, accessible title/desc). `Section.astro` = full-width band.
  On phones (<640px) SVG labels are drawn larger (see `global.css`), so check new figures at 375px for overlaps.
- `src/components/Term.astro`: inline glossary definition (`<Term>wedge</Term>`); fails the build if the term is missing.
- `src/components/RatioCalculator.astro`: the calculator on the Cost-Effectiveness page, prefilled with the worked example.
- `src/data/`: `site.js` (nav, reading order), `instruments.json`, `glossary.json`, `cases.js`.
- `public/images/`: the four landscape illustrations as WebP (900 and 1600 px). Originals are in the v1 repo.

## Content rules (non-negotiable)
- Every number on the site needs a source logged in `docs/FACT-CHECK.md`. If unsourced, phrase qualitatively or remove.
  Illustrative numbers (the worked example) must be labeled hypothetical on the page and logged as illustrative.
- US spelling. Plain, sequential prose; no grandiose openings. Section headings (h2/h3) in Title Case, as in v1.
- Landscape orientation: LOW ground = HIGH return / HIGH social value. Capital flows like water and pools in low points.
  Transitional gap = capital stuck in a local minimum behind a ridge; structural = financial low point is not the social one.
- Color grammar in figures: blue #1e40af financial, green #059669 social, amber #d97706 wedge/intervention,
  slate #94a3b8 dashed counterfactual, light blue fill = capital (water).
- Terminology: Transitional Access Gap, Structural Misalignment, navigate/terraform, walk-away test, wedge,
  six levers, payer, catalyst, Principle of Precision, bridge to nowhere, windfall. Do not reintroduce
  "Mode 1/Mode 2", "Blocked Flow", "Wrong Destination", or "deadweight loss" for windfall.
- Political topics (carbon pricing, budget laws) are described factually; the framework takes no side.
- Use `<Term>` for the first use of a key glossary term on a page, never inside another link or a heading.
- Front-matter labels containing commas must be quoted (`label: 'Gaps, Not Markets'`); the check script enforces this.
- Keep private source material out of the repo, and out of `.gitignore` (use `.git/info/exclude`). In the local repo,
  `archive/`, `iff 2.0 files/` and `.claude/` are excluded that way.
