# IFF v2: Implementation Plan

Prepared November 2, 2026, after a review of the v2 handover package (`iff 2.0 files/`), the live v1 site (`index.html`), the three critiques in `archive/`, and a full build and browser pass of the v2 project.

## 1. Where Things Stand

**v1 (live, `main`).** One 256 KB `index.html` rendered in the browser by React, Babel and the Tailwind Play CDN, plus five PNG illustrations of about 6.5 MB each (34.5 MB in total). Crawlers see only meta tags, there are no URLs below the home page, and the back button leaves the site. The content is strong in places, especially the two landscapes, the six-lever mechanism layer, the catalyst and the precision guardrails. But several examples are wrong or unsourced (the AMC "$7 guaranteed price", "67 million life-years", Educate Girls "$1.7M", ARC "$500M+", Interceptor G2 "70%" and others), the instrument catalogue scores 36 instruments with invented percentages, and the diagnostic asks two questions and ignores the second answer. v1 also carries a `Tooltip` component and a glossary-definitions map that are never used.

**v2 (the zip).** An Astro static site with 19 pre-rendered routes, about 0.9 MB in total. It keeps v1's design language and illustrations, adds an explicit objective (durable impact per concessional dollar), a payer layer, wedge geometry, durability by lever, five sourced cases, a 17-entry catalogue and a five-step diagnostic that produces a printable brief. It builds cleanly and `check-content.mjs` passes. It has not had browser QA, Lighthouse, a voice pass or deployment.

The v2 content addresses most of what the critiques asked for: a foundations path before the abstraction, common mistakes, the walk-away test up front, the starting question leading the precision section, and a diagnostic that produces a deliverable. Two critique items remain open: inline definitions of jargon where it first appears, and a worked example that runs the framework end to end with numbers.

## 2. What the Browser Pass Found

These are defects in the v2 build as delivered. All are fixable without changing the content.

| # | Issue | Where | Fix |
| --- | --- | --- | --- |
| 1 | Figure legend swatches all render grey, so the color key (blue financial, green social, amber wedge) is lost | Every legend | CSS specificity: `.legend i { border-top: 3px solid }` overrides `.k-fin` etc. Re-scope the color rules. |
| 2 | `.not-prose` does nothing. Prose rules (`h3` margin 2.5rem, sibling spacing, link and list styles) leak into cards, leaving large gaps above card titles | Framework, Mechanisms, Foundations, Payers, Cost-Effectiveness | Scope `.prose-iff` rules so they skip anything inside `.not-prose`. |
| 3 | Analytic SVG figures stretch to about 1,000 px in wide sections, so labels render near 28 px | Framework (ridge, terraform, wedge), others | Cap figure width (about 640 px) and center. |
| 4 | Contents bar shows "Gaps" instead of "Gaps, Not Markets" | Framework | Unquoted comma in YAML front matter. |
| 5 | Numbered badges squeeze into thin pills beside long card titles | Framework, two landscapes cards | `flex-shrink-0`. |
| 6 | `h2` headings on About (and any plain prose page) are unstyled, body-sized | About | Add a `.prose-iff h2` style. |
| 7 | Printed diagnostic brief loses its padding (print CSS zeroes every `section`) and carries no attribution or date | Diagnostic, print | Narrow the print rule; add a print-only footer with site, date and license. |
| 8 | Low-contrast text (`text-slate-400` on white; `text-slate-500` on the dark footer) fails WCAG AA | Home, contents bars, footer | Darken on light, lighten on dark. |
| 9 | Heading levels skip (`h2` then `h4`) | Foundations, Mechanisms | Re-level headings. |
| 10 | Ratio's "×" separators strand at line ends on phones | Home, Cost-Effectiveness | Stack the terms on small screens. |
| 11 | Google Fonts is the only third-party request, and the CSP has to allow it | All pages | Self-host Inter and Playfair Display, then tighten the CSP. |
| 12 | `scripts/render-figures.py` maps CSS variables that no longer exist | Tooling | Replace with a Playwright figure renderer (no Python dependencies). |

## 3. Content Consistency Issues

These are small, and none changes an argument.

- The catalogue says a corrective tax "moves the financial peak", which contradicts the valley orientation used everywhere else, and tags it "Payment design". Reword to "raises the floor under the harmful activity" and give it its own chip.
- Case, About, Open Questions and Related Work titles are in sentence case, while the navigation, case index and CLAUDE.md use Title Case. Standardize on Title Case.
- `FACT-CHECK.md` does not list four sources the site links (CGD on the AMC tail price, CGD/MSA partnership, FHI 360 on Levoplant, Frontier's annual update in Related Work). Add them.
- v1 visitors and old links may arrive with hashes such as `/#mechanisms` or `/#precision`. Netlify cannot redirect fragments, so a few lines of inline script on the home page will forward the old anchors to their new pages.
- Add schema.org structured data (author, license, date) so search engines and AI tools can cite the framework correctly.

## 4. Proposed Enhancements Beyond the Handover

These go further than the handover and need a decision (see Section 7).

**A worked cost-effectiveness example and calculator.** The ratio is the spine of v2, but nowhere does the site run it with numbers. A short, clearly labeled illustrative example (hypothetical figures, not a claim about any real deal) would show how the counterfactual term dominates, how a cheap guarantee can beat a grant on expected cost, and how a payer's lifetime caps a structural intervention. A small calculator beside it would let readers change the terms and watch the ratio move. For a reader used to GiveWell-style analysis, this is the piece most likely to make the framework feel rigorous rather than rhetorical.

**A sixth diagnostic step: the back-of-envelope ratio.** Optional numeric fields for each ratio term, producing a cost per unit of durable impact on the printed brief, with a low and high counterfactual to show sensitivity.

**Inline definitions.** The first use of a defined term on each page (wedge, payer, additionality, concessional capital, walk-away test) links to its glossary entry and shows the definition on hover or tap. This answers the critiques' most repeated request without adding a separate beginner track.

**Four catalogue entries restored from v1, rewritten without unsourced numbers.** Offtake agreements (the climate equivalent of a volume guarantee, and the clearest evidence for the "same structure across sectors" claim), tiered pricing, priority review vouchers and other regulatory incentives, and voluntary carbon credits as a voluntary payer.

## 5. Implementation Steps

1. **Set up.** Work from a clean copy of the v2 project; install pinned dependencies; build; serve locally.
2. **Fix the defects** in Section 2, items 1 to 12.
3. **Self-host fonts** (Inter variable, Playfair Display) from npm packages, preload the two files used above the fold, drop the Google Fonts links and remove `fonts.googleapis.com` and `fonts.gstatic.com` from the CSP.
4. **Apply the content consistency changes** in Section 3.
5. **Build the agreed enhancements** from Section 4, as static HTML with small inline scripts, consistent with the "no client framework" rule. Every illustrative number is marked as illustrative on the page.
6. **Extend `check-content.mjs`** to also catch: images over 100 KB, images without width and height, external scripts, unquoted-comma YAML labels (by checking every contents link resolves to its full label), and pages missing a canonical URL.
7. **Visual QA** at 375, 768 and 1280 px for every route, plus the printed brief, using Playwright screenshots.
8. **Lighthouse** on mobile for each page template, target 95+ in all four categories, and fix what it flags.
9. **Port into the repo** on a new `v2` branch, following the handover: remove `index.html` and `Image0-4.png` on that branch (they remain on `main`), copy the project in, replace the README, and move private filenames out of `.gitignore` into `.git/info/exclude`.

   One addition the handover misses: the private files now sit in `archive/` and `iff 2.0 files/`. v1's `.gitignore` caught them by filename, but v2's does not. Both folders, plus `.claude/`, go into `.git/info/exclude` before anything is staged, so the CHAI document and the critiques cannot be committed by accident.
10. **Verify from the repo copy:** clean install, build, content check, screenshots.
11. **Hand back** a short list of what remains for you: the voice pass, the CHAI and license decision, pushing the branch, reviewing the Netlify deploy preview, merging, and submitting the sitemap.

## 6. What Stays With You

- **Voice pass** on the new sections (Cost-Effectiveness, Payers, wedge geometry, cases) and any enhancements. I will keep to your register, but the claims drawn from your practitioner knowledge (packaging harmonization in the implants case; the absence of a structural payer for community mental health) need your read.
- **CHAI and licensing.** A skim of `CHAI-Market-Shaping-Framework 202410.pdf` suggests little structural overlap: it organizes market shaping by value-chain barrier (R&D, regulatory, manufacturing, procurement), while the IFF is built on landscapes, levers and payers. Whether CHAI is comfortable with publication, and with CC BY 4.0 permitting commercial reuse, is still yours to confirm. Note that v1's `.gitignore` already published those filenames on GitHub; removing them from the current file does not remove them from history.
- **Pushing and deploying.** Netlify will read `netlify.toml` and build the branch preview once it is pushed.

## 7. Decisions (answered November 2, 2026)

1. Landscape orientation: keep valleys.
2. Enhancements: all four (worked example and calculator, diagnostic ratio step, inline definitions, four instruments).
3. Git: commit on a `v2` branch and push for a Netlify deploy preview.
4. Feedback channel: GitHub issues only.
