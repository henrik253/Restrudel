# Corpus growth (Track B B2) — findings

**Task:** scrape strudel.cc / the wider web for more real Strudel patterns to
grow the corpus (currently **697 patterns from 8 sources**,
`analysis/results/*`).

**Verdict: the public Strudel-music supply is largely saturated.** The
strudel.cc examples are already in-corpus, and the broader public ecosystem
offers little clean, ingestible additional *music*. The durable growth levers
are the app's opt-in user uploads (Track A A6) and scaled generation (B6) — not
further scraping. B2's lasting output is the **pluggable source manifest**
(`corpus/sources.yaml`) + this evidence, so the decision is auditable and future
additions are one edit away.

## Evidence

1. **strudel.cc's built-in examples are already in the corpus.** The site's
   example dropdown is served from the bundled `website/src/repl/tunes.mjs`.
   Two of our 8 sources are the Strudel repo itself — `uzu-strudel`
   (canonical, Codeberg) and `strudel-coding-music` (a fork) — and the corpus
   already extracts patterns from their `tunes.mjs` (confirmed:
   `corpus_test.json` lists `uzu-strudel/website/src/repl/tunes.mjs` and
   `strudel-coding-music/website/src/repl/tunes.mjs`). Re-scraping the site
   would re-collect patterns we already have.

2. **No public gallery of user patterns exists to scrape.** strudel.cc's share
   feature stores patterns behind opaque hash URLs with no enumerable index;
   the site is a Vite SPA (examples bundled in JS, not a REST list); and
   Codeberg actively serves garbage to scrapers ("If you are an AI scraper …
   stop visiting").

3. **The public GitHub ecosystem is tooling, not songs.** `topic:strudel`
   (sorted by stars) and keyword searches returned editors/plugins
   (`strudel.nvim` 464★, `strudel-flow` 218★), converters, MCP servers, LSPs,
   and AI generators — but essentially no song collections beyond the four tiny
   personal repos below.

4. **The few real new sources are blocked on license or format** (see
   `corpus/sources.yaml` → `candidates`):

   | repo | license | content | why not ingested |
   |---|---|---|---|
   | fcreme/strudel-livecoding | **none** | ~13 patterns in `file.txt` | unlicensed (all-rights-reserved) |
   | mktwohy/LiveCodingMusic | **none** | 3 `.js` songs | unlicensed |
   | hannahlovegood/algorave-band | AGPL-3.0 | 16 one-liner presets in `index.html` | needs `.html` extraction; trivial presets, low value |
   | danbiilee/uvwy | MIT | patterns in `.ts` (visuals app) | needs `.ts` extraction; low expected yield |

   The extractable ones (`.txt`/`.js`) are unlicensed; the clean-licensed ones
   (`.html`/`.ts`) aren't in a supported format and carry little musical
   content. None clears the bar of *clean-licensed AND non-trivial AND
   ingestible*, so none was auto-added while the corpus decision is unattended.

## What was built

- **`corpus/sources.yaml`** — the single pluggable source list: all 8 ingested
  sources with author/license/kind, plus the 4 candidates with their exact
  blocker. B5's repo-level split reads this to reason about distinct authors.
- **`scripts/corpus/add_sources.sh`** — adds a chosen candidate as a shallow
  submodule (the analysis auto-discovers it by directory name); no other code
  change needed.

## Recommendation

- **For B5:** plan the repo-level split around the existing **8 sources** —
  scraping will not meaningfully increase author diversity. (If more authors are
  wanted, opt into the candidates above, accepting their caveats.)
- **For B6:** generation remains the scalable path to *more* Strudel data;
  timbre/renderer **diversity** (B4) matters more than raw pattern count.
- **Longer term:** the app (Track A) turns every user upload into a potential
  new real-audio corpus item — the growth engine scraping can't be.
