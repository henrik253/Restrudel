# Maximizing the YourMT3+ fine-tune for electronic music — and getting from MIDI to Strudel code

*Deep-think for roadmap **B7/B8** (model v2) and **A2/A5** (codegen). Written 2026-07-17.*
*Status 2026-07-24: R1 (the v2 hygiene run) is executed — v2mix seeds 42/1337
trained + benchmarked (roadmap Phase 8 B7/B8). Still unexecuted here: R2–R5
(renderer-diversity run, WiSE-FT retention frontier, decoder-freeze,
pseudo-labeling) and the codegen ladder c1–c5.*
*Method: start from what is proven, propose a version, attack it, fix what the attack
exposes, repeat. Every fact is sourced to a repo doc; every imported technique is marked
as literature-transfer (plausible here, not yet proven here).*

Grounding documents:
[benchmark_interpretation_20260713.md](benchmark_interpretation_20260713.md) (v1 results + adversarial critique),
[roadmap.md](roadmap.md) Phase 8 B0–B6 (base-model ground truth, external data,
generation strategy, repo split, train-side generation — the per-step docs were
folded into the roadmap 2026-07-24),
`notebooks/05_finetune.ipynb` (the exact training invocation).

---

## 0. The ground truth we are optimizing from

Facts that constrain everything below:

| Fact | Source |
|---|---|
| Base model's **entire** synth-timbre experience = **26 static Kontakt sample patches** (14 lead + 12 pad) from Slakh; nothing live-synthesized | B0 |
| **Synth Bass (GM 38–39) was never seen at all** — Slakh skipped all 27 synth-bass stems; the class is folded into "Electric Bass" | B0 |
| The paper's own eval: Synth Lead F1 **0.820 in-domain → 0.023 on real recordings** (Pad 0.413 → 0.009) | B0 |
| Our v1 (strudel50, 3 000 steps, LR 1e-4): Synth Lead **0.000 → 0.515**, Bass 0.000 → 0.169, drums 0.530 → 0.844, multi-instr 0.521 → 0.839 on the Strudel corpus test | benchmark doc |
| Cost of v1: slakh **−14.9**, maestro **−10.7** onset-F1 forgetting; slakh's own Synth Lead halves (0.733 → 0.387) | benchmark doc |
| v1's split leaked (same repos train/test) → **fixed & frozen** by B5 (leave-repositories-out, dedup-audited: 0 cross-boundary dupes, max Jaccard 0.208) | B5 |
| v1 was **one seed**, small n, no CIs; val-time pitched F1s were `nan` (checkpoint monitor never fires); no `--seed` flag exists in `train.py` | benchmark doc, nb05 |
| Timbre-coverage generation (S1), time-preserving audio aug (S2), drum-bank rotation (S3) are **built and locally verified**, not yet run at scale | B4, B6 |
| Renderer plan: **DawDreamer** hosting **Surge XT (~2 000 patches) / Dexed (real DX7 SysEx) / Vital** as VST3; MIDI feedstock **MetaMIDI** (143 868 genre-tagged, CC BY); **NES-MDB** (MIT, headless, exact labels) is the fastest external win | B3 |
| Architecture is fixed by the released checkpoint: Perceiver-TF encoder + 13-channel multi-T5 decoder, `mc13_full_plus_256` vocab, 16 kHz, 2.048 s windows | nb05, project plan |

Two readings of these facts anchor the whole strategy:

1. **The base model is not "bad at synths" — it is over-fit to 26 timbres.** It detects
   onsets on Strudel audio (onset_f 0.44) while scoring exactly 0.000 on synth classes:
   the notes are heard, the *instrument attribution* fails. The lever is timbre
   variety, not more notes. (B0's cautionary tale: N static timbres from one renderer
   ⇒ a cliff exactly at the edge of those timbres. Fine-tuning on Strudel's default
   sawtooth alone would rebuild the same cliff one renderer over.)
2. **v1's headline number is real but the experiment around it was weak.** The gain
   replicated across all five Strudel categories (survives the critique), but the split
   leaked, one seed ran, the eval was in-renderer only, and several 0.000s smell like
   class-mapping artifacts rather than model failures. **Improving the *measurement*
   is worth as much as improving the model** — half the iterations below are about
   that, deliberately.

### What "maximize" means (define the objective before touching knobs)

Optimization target, in priority order:

- **T1 — External electronic F1**: note-level onset F1 (±50 ms, `mir_eval`) on audio
  **not rendered by Strudel** — per-class (Synth Lead, Synth Pad, **Bass**, drums) and
  drums-excluded multi-instrument F1. *This metric does not exist yet. Building it is
  step one; nothing can be claimed "maximized" without it.*
- **T2 — Strudel-corpus test F1** (the frozen B5 124-pattern set): the product domain
  the app serves today. Must not regress vs strudel50.
- **G1 — Retention guard**: slakh / maestro / egmd onset F1 within an explicit budget
  of base (proposal: ≥ base − 5 absolute; v1 spent −15/−11).
- **G2 — Statistical honesty**: ≥2 seeds on any compared configuration; bootstrap CIs
  over files; no conclusion from differences inside the noise band.

Everything below is judged against T1/T2 under G1/G2. Compute envelope: Colab A100
(~3.5 h per 3 000 steps at bsz (4,8) — nb05 measured), so a 15 000-step run ≈ 17 h;
budget honestly around that.

---

## Part 1 — The fine-tuning ladder

Each version: what it is → why it should help → **attack** (what's wrong / what would
falsify it) → what survives into the next version.

### v0 — What Phase 6 actually did (baseline for critique)

3 000 steps, LR 1e-4, mix strudel .50 / slakh .25 / maestro .15 / egmd .10, one seed,
hash-based leaky split, eval on Strudel-rendered audio only, checkpoint = last step
(the `validation/macro_onset_f` monitor never logged → best-checkpoint selection was
dead code), training-time pitch-shift ±2 active, stem augmentation effectively
slakh-only (only slakh has `has_stem: true`).

**Attack.** Documented in the benchmark critique: leaky split (fixed since), renderer
confound (unaddressed), drum-weighted headline metric, single seed, LR-vs-mix
conclusion invalid, exact-0.000s unexplained. v0's real lesson: *the run produced a
strong direction and a weak experiment.*

### v1 — Fix the measurement before spending GPU (cheap, mandatory)

Do these **before** any v2 training run; they convert every later GPU-hour into
information instead of anecdote:

1. **Build T1 — the external eval — first.** Three tiers, increasing cost:
   - **Held-out-renderer render** of the B5 *test* patterns' MIDI through DawDreamer
     synths (Surge patch set disjoint from any training patches): same notes, foreign
     timbres. Isolates the renderer confound directly — the critique's #1 ask.
   - **NES-MDB test slice** (real electronic timbre, exact labels, zero labeling work).
   - **~20–30 hand-labeled real clips** (EDM/synthwave/techno, 8–16 bars each; onsets
     only for lead/bass/drums where unambiguous). Slow but this is the only tier that
     tests *mastered mixes*. A6's consented user uploads grow this over time.
2. **Class-mapping audit** (critique #7): per-class reference/predicted event counts +
   a **program confusion matrix** on the corpus test. If base's exact-0.000s are
   mapping artifacts, part of our "gain" is bookkeeping, and part of Bass 0.169 may be
   recoverable *without training* (decode-side program remap). Hours of work,
   potentially rewrites the conclusions — highest information-per-euro item here.
3. **Fix the val monitor + seeds.** Log `validation/macro_onset_f` for pitched classes
   (it is `nan` today), so ModelCheckpoint actually selects; add `seed_everything`
   (train.py has no `--seed` — patch via the nb05 marker-guarded mechanism); run
   everything ≥2 seeds from here on.
4. **Report drums-excluded multi-F1 + per-class support weights** alongside multi_f.

**Attack.** "This improves nothing." Correct — it improves *claims*, which is what
B8's decision gate consumes; and item 2 may improve the product for free. Risk:
hand-labeled tier is small → treat T1c as test-only, never tune on it; keep CIs wide
and honest. Survives: everything (v1 is a permanent floor, not a choice).

### v2 — Run the planned fine-tune right (optimization hygiene)

The B7 plan as written, made concrete:

- **LR 3e-5** (vs 1e-4), cosine, warmup (fixed at 1 000 steps in `config.py` — fine at
  this scale; note `final_cosine: 1e-5` means the floor is ⅓ of peak — consider
  lowering to ~3e-6 so late training actually anneals).
- **10–20k steps** (nb05's 3 000 ≈ 6 passes over the strudel pool; more steps at
  gentler LR is the standard trade — literature-transfer: fine-tuning stability
  favors LR ↓ + steps ↑ at fixed compute).
- **Data:** B5 leak-free split; regenerate the synthetic batches with **S1 coverage +
  S3 bank rotation** (B1 purged the leak-tainted ones); **S2 audio aug ×1–2 variants
  per render, train-side only**; spread the density knob.
- **Mix:** keep replay (slakh .25 / maestro .15 — v1's forgetting happened *with*
  this replay, so don't reduce it), rebalance the rest toward strudel + new
  electronic data as it lands.
- Keep training-time pitch-shift ±2 (label-consistent in their pipeline; helps timbre
  variety cheaply). Batch via the nb05 OOM ladder; if forced to (2,4), compensate with
  `accumulate_grad_batches: 2` (config knob, currently 1) to keep the effective batch.
- **2–3 seeds**; pick checkpoints by the (now working) val monitor.

**Why this helps:** v1's critique showed forgetting ∝ LR is *untested*; 3e-5 is the
cheapest probe. More steps over more diverse data is the only defensible way to use
the S1–S3 machinery.

**Attack.**
- *Still one renderer.* Every pitched training timbre is still Strudel's engine (+
  EGMD drums + replay). On T1 (foreign renderers, real mixes) v2 should improve
  little — that is precisely the B0 cliff. If v2 *does* jump on T1, the thesis
  ("timbre diversity is the axis") loses support and v3 should shrink. Falsifiable —
  good.
- *Bass may stay broken.* If the audit (v1.2) shows Strudel bass events are scarce or
  mapped oddly, no LR fixes that; the generator must force bass-register voices
  (cheap knob in `generate.mjs`), and v3's synth-bass rendering becomes the main fix
  for a class the base has literally never seen.
- *Replay ratio is a guess.* v1 tested one replay setting; keep an ablation arm.

Survives: hygiene (LR, steps, seeds, monitor), S1–S3 data, replay — plus a named
hypothesis for v3 to test.

### v3 — Attack the actual axis: renderer & timbre diversity (the thesis step)

This is where the differentiator lives. Ranked by (expected T1 gain ÷ engineering):

1. **NES-MDB in the mix** (Effort S, B3's "fastest win"): real electronic timbre,
   exact per-voice labels, MIT, headless renderer. Narrow palette (2A03) — it is one
   more *renderer family*, not a solution.
2. **DawDreamer renders** (Effort M–L, the core bet): MetaMIDI genre-filtered
   electronic MIDI → Surge XT / Dexed / Vital via the scaffolded
   `scripts/dataset/render_synths.py` + `GM_SYNTH_PATCH_MAP`.
   - **Patch randomization within class** is the point — B0's lesson is that *static*
     patches build cliffs. Surge's ~2 000 patches + parameter jitter ≫ 26 Kontakt
     multis. Vital: generate own patches (factory presets non-redistributable, B3).
   - **Synth-bass first.** GM 38–39 is the never-seen class: over-map it, render whole
     bass-heavy MIDI subsets, and track its per-class F1 as the single most sensitive
     indicator that new timbre knowledge actually entered the model.
3. **Per-voice stems for Strudel renders** (B6 leftover, underused lever): render each
   `$:`/`stack` voice separately, set `has_stem: true` for the strudel dataset — this
   switches on YourMT3's **own** intra-stem dropout (p .7) and **cross-dataset stem
   mixing** (`max_k 3, tau .3`) for our data, which today only slakh enjoys.
   Cross-mixing a Strudel sawtooth lead over Slakh's band is a *manufactured
   RWC-Pop*: exactly the "synth over real mix" scene where the base collapses
   (0.82→0.02). Cost is render-time only; the training code path already exists.
4. **S2 mastering chain over everything new** (already verified time-preserving,
   ±50 ms onsets intact — B6).
5. **Class-balanced sampling**: after the v1 audit produces per-class event counts,
   oversample files rich in the weak classes (bass, pads) rather than uniformly.

**Attack.**
- *Label alignment is the silent killer.* VST render latency, FX pre-delay, or
  anything time-shifting corrupts the ±50 ms onset labels — the same reason B4 banned
  time-stretch. **Gate:** before rendering at scale, render a click-track MIDI probe
  per synth/patch family, cross-correlate audio onsets vs MIDI, require ≤20 ms
  systematic offset (correct it if constant, drop the patch if not).
- *GM→patch mapping errors are systematic label noise.* A wrong mapping teaches the
  model wrong programs at scale. Mitigation: map conservatively (few, well-audited GM
  classes: bass / lead / pad / keys), audit with the confusion matrix, and remember
  the model's *class* granularity is coarse (`mt3_full_plus`, 34+2 classes) — we do
  not need per-patch truth, only per-class truth.
- *Colab render throughput is unverified* (B3 flags DawDreamer RTF + headless VST3
  as open). Run the throughput spike before promising volume.
- *Drowning the product domain.* T2 (Strudel corpus) still guards the app; keep
  strudel's mix weight ≥ the new-data weight in the first v3 run and watch T2.
- *Vocabulary temptation — resist it.* Collapsing the program vocab to an
  "electronic taxonomy" would misalign the checkpoint's decoder and **break v4's
  weight-space methods** (they require identical parameterization). Fix taxonomy at
  the *decode/eval mapping* layer instead; a vocab change is a different project.

Survives: multi-renderer data with alignment gates, stems-for-strudel, class
balancing — all feeding the same `mc13_full_plus_256` model.

### v4 — Retention engineering: keep what the base knows (cheap wins, do always)

v1 spent −15 slakh / −11 maestro. Replay alone didn't prevent it. Techniques in order
of confidence-per-cost (all literature-transfer, all cheap, none require retraining):

1. **Weight-space interpolation (WiSE-FT; Wortsman et al. 2022):**
   θ(α) = α·θ_ft + (1−α)·θ_base, sweep α ∈ {0.5 … 1.0} on val, report the whole
   frontier on T1/T2/G1. Same init + modest steps ⇒ same loss basin ⇒ interpolation
   is well-posed. In the robust-fine-tuning literature this recovers *most* retention
   for a small in-domain cost; here it turns "−15 slakh" from a verdict into a slider
   the B8 gate can choose on. **Zero training cost — the single highest
   expected-value untried item in this document.**
2. **Model soup across seeds** (Wortsman et al. 2022): uniform-average the 2–3 seed
   checkpoints; often ≥ best single seed, and we are running the seeds anyway (G2).
3. **Checkpoint averaging / EMA** over the last k validation checkpoints: same family,
   also free.
4. **Partial-freezing ablation (one run):** freeze the multi-T5 decoder (the token
   "language"), fine-tune encoder + pre-encoder (the acoustic front). Hypothesis: the
   thing that must change is *audio→feature attribution*, not token grammar, so
   decoder-freeze should retain more (slakh/maestro) at equal Strudel gain. If it
   wins, it also halves trainable params. If it loses, that is evidence the decoder's
   program priors are part of the problem — which redirects effort to decode-side
   remapping. Either result is informative.
5. **L2-SP / LoRA — noted, deprioritized.** Both mainly buy forgetting-reduction
   during training; interpolation buys it after training without touching the loop,
   and at 60M params full fine-tuning is not the bottleneck. Revisit only if
   1–4 leave a gap.

**Attack.** Interpolation trades away some in-domain gain — if the T2 cost at
α≈0.7–0.8 exceeds a few points, the frontier will show it (that is the point of
reporting the curve, not one α). Soups require identical architecture/vocab across
members — v3 already committed to that. Honest risk: these methods polish a model
that v3 must first make *worth polishing*; they are force-multipliers, not the force.

### v5 — Learn from unlabeled reality (after v3/v4, not before)

- **Pseudo-labeling / noisy-student loop** (Xie et al. 2020, transfer): transcribe
  unlabeled real electronic audio (FMA-electronic; A6's consented uploads) with the
  current best model; **filter pseudo-labels with the project's unique verifier** —
  run the events through codegen → `render_offline.mjs` → log-mel similarity against
  the source clip, keep only clips above τ (the A5 harness as a physics check on
  labels, something generic AMT projects cannot do); mix 5–15 % into the next round.
- **Inference-time ensembling** (eval-only): average decodes across the seed soup, or
  pitch-shift TTA (±1 semitone in, shift tokens back, merge). Too slow for the app;
  use to measure the gap between "model" and "model family" — if large, training has
  headroom; if small, data is the remaining lever.

**Attack.** Pseudo-labeling amplifies the model's biases (it will happily confirm its
drum-heavy worldview); the round-trip filter mitigates but drum-dominates the kept
set — enforce class quotas. It also needs A6 to exist. Strictly a v3+ follow-on; do
not let it jump the queue — its gains compound *on top of* a timbre-diverse base, not
instead of one.

### The run plan (what to actually execute, in order)

| Run | Isolates | Config Δ vs previous | Cost (A100) | Kill / promote criterion |
|---|---|---|---|---|
| R0 | eval infra | v1 items 1–4, no training | ~0 GPU | audit may reroute everything below |
| R1 | LR + steps + clean split | v2: LR 3e-5, 15k steps, S1–S3 data, 2 seeds | ~2×17 h | beats strudel50 on T2 with G1 ≤ −8; else revisit LR/steps |
| R1b | replay ratio | slakh .15 vs .25 arm (1 seed) | ~17 h | pick arm by G1 at equal T2 |
| R2 | renderer diversity | v3: + NES-MDB + first DawDreamer tranche (bass-heavy) + strudel stems on | ~2×17 h | **T1 up vs R1** (esp. Bass > 0.3) — the thesis test; if T1 flat, re-examine mapping/alignment before scaling renders |
| R3 | retention frontier | v4: WiSE-FT sweep + seed soup on R2 (no training) | ~0 GPU | ship the α meeting G1 with best T1/T2 |
| R4 | decoder-freeze | v4.4 (1 seed) | ~17 h | informative either way (see v4.4) |
| R5 | semi-supervised | v5 loop, one round | ~17 h + renders | only after R2 promotes |

Decision gate stays B8's: the new checkpoint replaces strudel50 in the app
(`model_version`) only if it wins on **T1** without violating **G1** — now with CIs.

### Recipe box (concrete starting flags for R1)

Via nb05's mechanism (presets injected, patches marker-guarded):

```
amt/src/train.py ft_v2_s1  -d strudel_v2_mix  \
  -tk mc13_full_plus_256 -dec multi-t5 -nl 26 -enc perceiver-tf -sqr 1 \
  -ff moe -wf 4 -nmoe 8 -kmoe 2 -act silu -epe rope -rp 1 -ac spec -hop 300 -atc 1 \
  -pr bf16-mixed -bsz 4 8 -lr 3e-5 -it 15000 -g auto
# plus notebook-side: seed_everything(S); fix macro_onset_f logging;
# preset strudel_v2_mix = strudel .45 / electronic_new .15 / slakh .25 / maestro .15
# (egmd folded into electronic_new once NES-MDB lands); accumulate_grad_batches 2 if bsz drops.
```

---

## Part 2 — From MIDI/events to Strudel REPL code

Same method: version → attack → refine. Context: the app already ships **c0**; the
roadmap's A2 wanted a rule-based compiler; the user decision in the app phase made the
LLM the transformer of record. These are not rivals — the ladder below composes them.

**One metric to rule the ladder (build first, mirrors Part 1's v1):**
**symbolic round-trip F1** — feed events E in, get code C out, re-extract events
E′ = `queryArc(C)` (the Phase 2 labeler), score E′ vs E with the same `mir_eval`
onset-F1 used everywhere else. Exact, milliseconds-cheap, no audio, CI-able. The
app's current density gate (0.6–1.5×) is a 1-bit shadow of this; the upgrade is
strict subsumption. Second metric, weekly not per-commit: **audio round-trip** —
render C with `render_offline.mjs`, log-mel similarity vs the input render (this is
exactly A5, promoted from UI garnish to objective). Golden set: the B5 test split's
ground-truth events (124 patterns, never seen by any tuning).

### c0 — What ships today (app A2): grid → LLM → engine-validate

16th-note grid per {drums, pitched} voice, folded-bar text description, corpus-prior
system prompt, user guidance block, engine validation in a killable worker, density
gate, ≤3 feedback retries (`app/backend/src/llm/`, port of `scripts/midi_to_strudel.py`).

**Attack.**
- The grid assumes **straight 4/4 sixteenths**: swing, triplets, and any meter ≠ 4/4
  are quantized into mush *before* the LLM ever sees them — an information funnel no
  prompt can undo.
- **Two voices only** (drums/pitched): a bass line + lead + pad collapse into one
  `pitched` row with comma-chords; the LLM must un-mix what we mixed.
- Timbre enters only as static corpus priors; nothing from the *audio* (a dark pad
  and a bright pluck get the same suggestion).
- Validation checks density, not correctness — a rhythmically wrong pattern at the
  right event rate passes.
- One sample, no search: the first plausible code wins.

### c1 — Deterministic compiler as the floor (and the fallback)

Pure-Node, no LLM, guaranteed-valid, testable to a number:

- **Voice separation** by (program, drum-flag, register): drums / bass (≤ ~E3) /
  lead / poly-chords → one `stack()` entry each.
- **Meter-aware quantization**: try 16 and 12 steps/bar (and swing offsets), keep the
  grid minimizing onset displacement; downbeats from the GPU worker anchor bar 0.
- **Pattern mining** on each voice: repeated bars → `<bar1 bar2>`, run-lengths → `*n`,
  euclidean detection (does the onset set match E(k,n) under rotation?) → `(k,n)`,
  rests preserved; multi-bar → `.slow(n)` (the timing rule c0's prompt teaches — here
  it is enforced by construction).
- **Velocity/duration** → `.gain` patterns and `.release`/`clip`.
- **Timbre mapping table** from `analysis/results/` (program+register → sound + fx
  defaults; drums → bank by detected kit).

Why: this raises the *floor* (c0's LLM failures fall back to a valid sketch instead of
`validation_exhausted`), gives the ladder its baseline number, and produces the
skeleton c2 needs. **Attack:** output is mechanical and un-idiomatic; timbre table is
crude; euclid/swing detection has edge cases — accept, because c1 is never the
ceiling, it is the floor + the IR.

### c2 — LLM as *musicalizer* of the skeleton, not transcriber of a text grid

Restructure the prompt: input = c1's already-correct skeleton + **audio-derived
hints** (tempo, spectral centroid → lpf ballpark, percussive-bank guess, energy
curve) + **retrieval-augmented few-shot**: the 2–3 nearest corpus patterns by
rhythmic signature/density from the 731-pattern train split (the corpus as a style
library, not just priors). Task: "make this idiomatic and sound-designed; do not
change the notes." Gate: engine-valid **and symbolic round-trip F1 ≥ τ** (the c0
density gate upgraded); feedback on retry says *which voice* drifted.

**Attack:** retrieval needs an index (cheap: precompute per-pattern rhythm
signatures at analysis time); the LLM will still occasionally "improve" the rhythm —
that is what the F1 gate is for; latency grows (mitigate: skeleton is already
shippable, stream the upgrade). Grammar-constrained decoding of mini-notation is
possible (EBNF exists) but heavy — the validator loop already bounds damage; defer.

### c3 — Search with the renderer in the loop (A5 becomes an objective)

Generate k candidates (temperature / prompt variants), render each offline, score
**audio round-trip similarity**, return the argmax (and show the score in the UI as
already planned). Optionally one refinement round: per-band spectral deltas →
natural-language feedback ("hats too loud, bass an octave high"). k≈4–6 renders of a
10 s pattern ≈ seconds each server-side — affordable per conversion.

**Attack:** spectral similarity is blunt — it can prefer timbre-match over
note-truth; therefore select on **lexicographic (symbolic F1, then audio score)**,
never audio alone. Latency budget must be honest in the UI (the app's staged
progress already narrates). This is the same machinery as Part 1 v5's pseudo-label
filter — build once, use twice.

### c4 — Train our own events→Strudel model (the data is already ours)

The generator + corpus give unlimited **aligned (events, code) pairs by
construction** — a supervised seq2seq task we uniquely own. Two routes:
(a) fine-tune a small open code model (LoRA) or ByT5-small on
grid-text → Strudel; (b) **rejection-sampled distillation**: log every c2/c3 output
that passed the gates in production and train on those (the big LLM + validator as a
teacher). Serve locally: no API cost, low latency, stylistic consistency; the big
LLM remains the "guidance prompt" path.

**Attack:** engineering + maintenance for a solved-by-API problem — only worth it if
(i) API cost/latency actually bites in the app, or (ii) the thesis wants the claim
"the whole pipeline is ours." Gate on symbolic F1 parity with c2 before switching
defaults. Style diversity narrows — keep temperature and the corpus-retrieval
context.

### c5 — Horizon: audio → Strudel end-to-end

The dataset *is* (audio, code) pairs; a seq2seq from spectrogram to Strudel tokens
would skip MIDI entirely — scientifically the most interesting statement of the
thesis ("a neural decompiler for music"). Not roadmap-critical: it forfeits the
modular eval story (Part 1's F1s) that makes the current pipeline debuggable, and it
needs the v3 data scale first. Park it as the thesis-discussion chapter, revisit
after B8.

### Codegen priority

1. **Symbolic round-trip F1 harness** on the B5 golden set (c-metric; days, unblocks
   every comparison, immediately upgrades the app's validator gate).
2. **c1 compiler** (floor + fallback + IR; also de-risks LLM outages in the app).
3. **c2 skeleton+retrieval prompting** (biggest expected quality jump per effort).
4. **c3 k-best with round-trip scoring** (shared build with A5 + Part 1 v5 filter).
5. **c4 distillation** only if API cost/latency or thesis framing demands it.

---

## The one-page summary

- **Measure first**: external eval (foreign-renderer + NES-MDB + small real set),
  class-mapping audit, working val monitor, seeds+CIs — v1 is mandatory and cheap.
- **The axis is timbre/renderer diversity**, not steps or LR: S1–S3 at scale, then
  NES-MDB and DawDreamer/Surge/Dexed/Vital with alignment gates; **synth bass is the
  bellwether class** (the base has literally never heard one).
- **Stems for Strudel voices** switch on the augmentation machinery the base model
  was built with — an already-paid-for lever we currently give only to Slakh.
- **Forgetting is a slider, not a verdict**: WiSE-FT interpolation + seed soups cost
  zero GPU and turn the retention trade-off into a reportable frontier.
- **Don't touch the token vocabulary**; fix taxonomy at the decode/eval layer.
- **Codegen climbs a ladder** — deterministic floor → skeleton-guided LLM →
  renderer-in-the-loop search → optional distilled local model — all judged by one
  number (symbolic round-trip F1) plus one honest audio score (A5).
- **Unique structural advantage, used twice**: the Strudel renderer verifies both
  training pseudo-labels (Part 1 v5) and generated code (Part 2 c3). No generic AMT
  project has a ground-truth synthesizer in the loop.
