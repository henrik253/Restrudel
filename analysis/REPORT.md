# Phase 1 — Strudel corpus sound analysis

Evidence base for **distribution-weighted** synthetic data generation (roadmap
Phase 4). Regenerate with `python3 analysis/analyze_corpus.py`; plots/tables in
[`out/`](out/).

## Corpus
Fetched into `corpus/sources/` (all shallow clones, ~100 MB total, well under the
2 GB budget):

| Source | What |
|---|---|
| `eefano/strudel-songs-collection` | ~100+ full songs |
| `uzu-strudel` (Codeberg monorepo) | canonical `tunes.mjs`, `examples.mjs`, `my-patterns/`, **doc code-fences** |
| `honcoops/strudel_trance` | trance pattern examples |
| `yakuzadave/strudel-sampler-mixes` | sample-based patterns |
| `williamzujkowski/strudel-mcp-server` | genre-tagged patterns |
| `craii/strudel-coding-music`, `ideamonad/strudel-using-local-samples`, `therebelrobot/strudelplay` | app forks (pattern files mined, library code excluded) |

After extraction + cross-fork dedup: **855 unique pattern snippets**, **178 unique
sounds**, from 1,237 files scanned.

## Headline findings

**Sound category mix** (by occurrence):
- **drum-sample 62%**, waveform-synth 16%, other-sample 13%, soundfont(gm) 8%,
  noise <1%, zzfx <1%.

**Most-used sounds overall:** `bd` (441), `sd` (236), `hh` (224), then
**`sawtooth` (179, in 68 patterns)**, `cp` (124). Drums dominate, but **sawtooth
is the single most-used non-drum sound by a wide margin.**

**Synths specifically** (the bit that matters for our electronic-music goal):
| Rank | Synth | occ | patterns |
|---|---|---|---|
| 1 | `sawtooth` | 179 | 68 |
| 2 | `square` | 40 | 25 |
| 3 | `triangle` | 35 | 26 |
| 4 | `supersaw` | 32 | 13 |
| 5 | `sine` | 17 | 12 |
| — | `gm_*` soundfonts (electric bass, guitars, organ, choir…) | 162 total | melodic instruments |

**Drum-machine banks** (via `.bank()`): `RolandTR909` (15) > `Linn9000` (11) >
`RolandTR808` (8) > `AkaiLinn` (8) > `RolandMT32` (7).

**Most-used functions / effects** (by # patterns): `gain`, `room`, **`lpf`**,
`scale`, `clip`, `release`, `delay`, `speed`, `struct`, `bank`. The prominence of
**`lpf` + `release` + `room`/`delay`** confirms subtractive-synth filter/envelope
shaping is the common idiom — exactly the timbral variation YourMT3+ never saw.

## Implications for data generation (Phase 4)
1. **Lead/bass template should default to `sawtooth` + `lpf` + envelope** — it's
   the dominant real-world synth idiom. Add `square`/`triangle`/`supersaw` for
   variety, weighted ~ by the table above.
2. **Drum template: `bd`/`sd`/`hh`/`cp`** with `.bank()` drawn from
   TR909/TR808/Linn9000 — matches four-on-the-floor electronic reality.
3. **Randomize (and label) these params:** `lpf`/cutoff, `release`/ADSR, `room`,
   `delay`, `gain`, `speed` — they're the most-used and define timbre.
4. **Include `gm_*` melodic soundfonts** for harmonic/bass parts (8% share).
5. Generation should be **weighted by these distributions, not uniform**, so the
   synthetic set resembles how people actually write Strudel.

## Caveats
- Token extraction is regex-based; a few false-positive "sounds" (`a`, `numbers`)
  and generic names (`bass`, `lead`) appear in the long tail — they don't affect
  the head of the distribution.
- Tempo not reported: `setcps` vs `setcpm` units and beats-per-cycle are
  ambiguous to recover reliably from source.
