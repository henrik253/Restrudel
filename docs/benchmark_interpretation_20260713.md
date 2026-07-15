# Fine-tuning benchmark — interpretation (run `comparison_20260713-222456`)

**Setup.** Released YourMT3+ (`mc13_256_…_nops`) fine-tuned twice from the same seed for
3,000 steps (batch 8, LR 1e-4, bf16, A100-40GB, ~3.5 h/variant), differing only in the
nominal sampling mix: **strudel50** (strudel 0.50 / slakh 0.25 / maestro 0.15 / egmd 0.10;
effective ~55 % strudel draws) vs **egmd50** (strudel 0.10 / egmd 0.50; effective ~75 %
egmd draws). All numbers are note-level F1 (mir_eval, onset ±50 ms) against exact
`queryArc`-derived labels; corpus = true 111-file test split; synthetic batches scored on
their validation files (**val-diag** — in-distribution diagnostic, not honest
generalization); references capped at 50 files each.

## Verdict up front (calibrated after the adversarial review in §7)

The results land in the **"better where we wanted it"** branch — but the defensible
claim is narrower than the raw deltas suggest: fine-tuning taught the model correct
**Strudel-domain instrument attribution** (Synth Lead/Bass from exactly 0 to 0.31–0.52,
drums +0.31) **on audio from the same renderer it trained on**. Overall note *detection*
(onset_f) barely moves (+0.01), the flagship multi_f gain is largely drum-carried
(critique #1), and no non-Strudel synth audio has been scored yet — so "fixes synth
timbres" in general remains unproven until the external-EDM eval in §6 exists.
Everything below should be read with §7's critique in mind.

## 1. The thesis result: base YourMT3+ is blind to synth timbres; ~3.5 GPU-hours cures most of it

On the **real Strudel corpus test** (111 files):

| onset F1 | base | strudel50 | Δ |
|---|---|---|---|
| Synth Lead | **0.000** | 0.515 | +0.515 |
| Bass | **0.000** | 0.169 | +0.169 |
| drums | 0.530 | 0.844 | +0.314 |
| overall (onset_f) | 0.440 | 0.450 | +0.010 |
| **multi_f** (instrument-aware) | 0.521 | **0.839** | **+0.318** |

- The base model produces **literally zero** correct Synth Lead / Bass notes. This is
  the documented YourMT3+ failure mode on synthesizer timbres (training data = MIDI
  rendered through sampled acoustic instruments) — now quantified on our corpus.
- `multi_f` is the fairest single number for the task ("right note, right instrument")
  and it improves by **+0.32 absolute**. The flat overall `onset_f` (+0.01) is a
  pitch-only, instrument-agnostic metric: the base model already detects many *onsets*
  but attributes them to wrong instruments; fine-tuning fixes the attribution.
- Same pattern, larger, on the synthetic batches (val-diag): multi_f
  b1 0.118→0.686 · b2 0.046→0.543 · b3 0.173→0.815 · b4 0.163→0.569; Synth Lead from
  ≈0.00–0.02 to 0.37–0.82; drums from 0.06–0.29 to 0.71–0.90.

## 2. The A/B mix experiment: strudel50 wins everywhere on the target

egmd50 (electronic *percussion*-dominated) sits between base and strudel50 on every
strudel category and instrument group (e.g. corpus Synth Lead 0.41 vs 0.52; corpus drums
0.79 vs 0.84; corpus multi_f 0.78 vs 0.84) and is *worse than base* on corpus overall
onset_f (0.30 vs 0.44). Interpretation:

- Some synth-timbre ability transfers even at ~8 % strudel draws — but there is no
  substitute for training on the target timbre distribution.
- E-drum volume does not buy pitched-synth competence; it buys drum competence, which
  strudel50 largely gets anyway from its 55 % strudel draws (Strudel songs contain the
  TR-909/808 drum vocabulary).
- **strudel50 is the model to carry forward.**

## 3. Cost: forgetting on reference material — real, and largest on Slakh

| onset F1 | base | strudel50 | egmd50 |
|---|---|---|---|
| egmd (drums) | 0.923 | 0.906 (−1.7) | 0.910 (−1.3) |
| slakh (band) | 0.831 | 0.682 (**−14.9**) | 0.691 (−14.0) |
| maestro (piano) | 0.949 | 0.842 (**−10.7**) | 0.837 (−11.2) |

- **Slakh takes the biggest hit**, and the per-class detail is telling: slakh's own
  *Synth Lead* class halves under strudel50 (0.733→0.387) while Strudel's Synth Lead
  goes 0→0.52 — the model **re-anchored what "synth lead" sounds like** toward real
  subtractive synths and away from Slakh's soundfont-rendered ones. That is arguably
  the intended behavior wearing an unflattering costume: the two datasets *disagree*
  about the class, and 3,000 steps moved the boundary.
- Drum competence is robust everywhere (slakh drums only −1.6, egmd −1.7).
- Both variants forget slakh almost equally (−14.9 vs −14.0) **and maestro almost
  equally** (−10.7 vs −11.2), despite very different mixes — the forgetting tracks the
  *fresh optimizer + LR 1e-4*, not the sampling ratio. A gentler LR (§5) is therefore
  the first lever, not more replay.

For the project goal (transcribing synth-heavy electronic music) this trade is
acceptable: we give up band-transcription generality we never needed, and keep drums.
But any claim of a "general" improved model is off the table at this LR/step count.

## 4. Oddities to keep honest about

- **The "chords (pads/keys)" instrument group is n/a on the corpus test**: the 111
  corpus test files produced no Synth Pad/Piano/Organ per-class metrics at all (no
  scored reference events in those classes) — the corpus holdout is dominated by
  lead/bass/drum patterns. Pads must be assessed on the synthetic batches or a larger
  corpus split.
- **Piano/Guitar classes stay at 0.000 even after fine-tuning** on the synthetic
  batches that contain them. Likely small event support per batch and/or GM-class
  mapping of Strudel's sampled keys; needs a per-class support count before reading it
  as a modeling failure.
- **Validation-time pitched-class F1s were all `nan`** during training (only drums
  scored); the test.py path scores them fine. Validation-path quirk, not a label
  problem — but worth a root-cause before the next training run since it blinds
  mid-run monitoring.
- Batch 3 is anomalously easy (strudel50 onset_f 0.77 vs 0.40–0.51 for other batches):
  its generation seed produced sparser/cleaner patterns. Batch heterogeneity is a
  feature for training but forbids averaging the batches into one "synthetic" number.
- b4 overall onset_f slightly *drops* under strudel50 (0.521→0.505) while every
  instrument class improves — composition effect (more predicted notes → more
  cross-class competition on an instrument-agnostic metric). multi_f on b4 still
  +0.41.

## 5. If we had landed in the "worse overall" branch — and what we still do about the forgetting we did get

(kept for the record, since the mitigations below are the same ones that reduce forgetting)

- **Lower LR / shorter runs**: 1e-4 with a fresh optimizer is aggressive for a
  fine-tune; 1e-5–3e-5 with warmup would trade adaptation speed for stability.
- **Replay-heavier mixes**: raising slakh/maestro draw share bounds forgetting
  (egmd50's better slakh/maestro validation losses demonstrate the lever works).
- **Partial freezing / LoRA-style adapters** on the decoder only — the encoder embeds
  timbre, the decoder writes events; adapting only one side limits drift.
- **Longer mixed training**: 3,000 steps is 0.27 nominal epochs; the loss was still
  falling. More steps at a gentler LR likely buys both target gains and less
  forgetting.

## 6. How to make the good results better (scaling directions)

1. **Timbre diversity over volume**: randomize synth types (FM/wavetable), filter
   envelopes, effects chains per rendered pattern — the model must see the *space* of
   synth sounds, not more of the same four batches.
2. **More steps**: train/val losses still descending at 3,000 steps; 10–20 k steps at
   LR ~3e-5 is the obvious next run.
3. **A true held-out synthetic test render** (new seeds, rendered once, never trained
   or validated on) to replace val-diag scoring.
4. **Real-world electronic eval set**: a small hand-checked set of commercial EDM/
   synthwave stems is the missing external-validity evidence (also the reviewer #1
   request if this becomes a paper).
5. **Seeds**: repeat strudel50 with 2 more seeds to put error bars on the headline.
6. **Bass gap**: Synth Lead reached 0.52 but Bass only 0.17 — check label support and
   octave conventions (sub-bass onsets are hard at 16 kHz mel); possibly weight bass
   patterns higher in generation.

<!-- The section below was produced by an independent adversarial review agent given
the raw comparison_results.json and this document. Reproduced verbatim. -->

## 7. Critical review (adversarial agent)

**Overall verdict.** The central claim as stated — "base YourMT3+ is blind to synth timbres and fine-tuning fixes it" — is **overclaimed**. The data shows base onset_f on the corpus is 0.440, so the base model *detects* nearly half the notes; what it fails is instrument *attribution*. And the headline +0.32 multi_f is demonstrably drum-dominated, not synth-driven: egmd50, with only ~8% strudel draws and **zero** corpus Bass F1, still captures 81% of that multi_f gain (0.521→0.780 of 0.521→0.839). What genuinely survives is a narrower claim: fine-tuning teaches the model to emit correct Strudel-domain instrument labels (leads/bass from exact 0 to 0.31–0.52) and Strudel-drum vocabulary — on audio from the *same renderer* used in training, with no external validation. Single seed, no error bars, and a leaky corpus split make the effect size unquantifiable.

1. **The "fairest single number" is drum-weighted, and the draft doesn't check.** strudel50's corpus multi_f (0.839) exceeds *every* pitched class it contains (Synth Lead 0.515, Bass 0.169) and matches drums (0.844) almost exactly — multi_f is arithmetically drum-dominated on this corpus. egmd50 proves it: drum-heavy training with essentially no pitched-synth gain (Bass 0.000, onset_f *drops* 0.440→0.302) still yields multi_f 0.780. The honest headline is "drums +0.31, leads +0.52 from zero, bass +0.17, overall note detection +0.01." Calling multi_f fairest exactly where onset_f is flat is metric selection. **Fix:** report event-count-weighted per-class support and a drums-excluded multi_f.

2. **Renderer confound is untested and probably load-bearing.** Train and test audio come from the *same* Strudel engine, whose corpus is sawtooth-dominated (per the project's own analysis). Synth Lead 0.515 is consistent with "learned Strudel's default saw+lpf render," not "learned synthesizers." The draft admits the missing external EDM eval only in §6.4. Until one file of non-Strudel synth audio is scored, the thesis-level claim ("fixes synth timbres") has zero supporting evidence; only "fixes Strudel-rendered timbres" is supported.

3. **Leakage risk on the corpus split is high and unmeasured.** The 111 test files and 451 training corpus files come from the same 8 repos/authors; live-coding patterns within a repo are frequently near-duplicates (copied basslines, shared drum motifs). Worse, effective strudel exposure is ~24,000×0.55 ≈ 13,200 draws over 2,205 strudel songs ≈ **6 passes** over the strudel pool — the "0.27 epochs" framing hides that the target domain, including same-author material, was cycled repeatedly. **Fix:** repo-level (leave-one-repo-out) split, or at minimum a pattern-similarity dedup audit between train and test.

4. **The "forgetting tracks LR, not mix" inference is logically invalid.** Both arms have *identical* nominal slakh (0.25) and maestro (0.15) replay; equal forgetting (slakh −14.9 vs −14.0, maestro −10.7 vs −11.2) under equal replay tells you nothing about LR. No arm varied LR or replay ratio, so §3's "gentler LR is the first lever, not more replay" is a guess presented as a finding. Also note the metric switch: by the draft's own preferred multi_f, maestro forgetting is −13.1 (0.805→0.674), worse than the quoted onset −10.7.

5. **Single seed, n=50/21–25, no CIs — several quoted contrasts are plausibly noise.** egmd −1.7 vs −1.3, slakh −14.9 vs −14.0, maestro 0.842 vs 0.837, corpus Synth Lead 0.52 (strudel50) vs 0.41 (egmd50): with one run per arm and ≤50 files, none of these pairwise orderings is established. The ref sets are also a *capped* 50-file subset (selection rule unstated — first-N would bias). Only the large effects (0→0.5, −15 on slakh) are safely outside noise.

6. **Val-diag batches are doubly compromised** — scored on splits used for validation-based decisions during training *and* drawn from the same generator configuration as training files. The b1–b4 numbers (multi_f 0.54–0.82) are in-distribution training-success indicators, nothing more; §1's "same pattern, larger" sentence quietly launders them into evidence.

7. **Exact 0.000s smell like class-mapping artifacts, not (only) timbre blindness.** Base scores *exactly* 0.000 on Synth Lead/Bass across 111 corpus files while detecting onsets at 0.44 — a systematic program-mapping mismatch would produce precisely this. Conversely Piano and Guitar remain 0.000 *after* fine-tuning on batches that contain them (b1, b2, b4), which the draft flags but doesn't resolve; if the pipeline can zero out classes the model was trained on, it can zero out classes the base was never given a chance on. Add: maestro is scored with a piano-solo class scheme vs GM classes for strudel — the cross-category comparisons aren't apples-to-apples. **Fix:** per-class reference/prediction event counts and a confusion matrix of predicted programs on corpus files.

8. **Batch-3 explanation is asserted, not shown.** "Sparser/cleaner patterns" (strudel50 onset_f 0.770 vs 0.40–0.51 elsewhere) is offered with no note-density or polyphony statistics; base scores b3 mid-range (0.441), so "easy batch" doesn't obviously explain a strudel50-specific jump at n=21. Same for the b4 composition-effect story (0.521→0.505): plausible, unverified.

**What survives scrutiny**
- The ordering strudel50 > egmd50 > base on pitched-synth classes replicates across all 5 strudel categories — unlikely to be noise even without CIs.
- Both fine-tunes move corpus Synth Lead from exactly 0 to 0.31–0.52; *something* real changed in instrument attribution.
- Forgetting on slakh (−14 to −15) and maestro (−11) is real and honestly reported; drum retention (egmd −1.3/−1.7) is genuine.
- The slakh Synth-Lead re-anchoring story is directionally supported: strudel50 drops it more (0.733→0.387) than egmd50 (→0.562), scaling with strudel exposure.
- The draft's own §4/§6 self-criticisms (val-diag, missing external eval, seeds) are correct — they just aren't allowed to weaken the verdict in §1, and they should.

## 8. Response to the critique — accepted actions

Ordered by how much they change conclusions, not by effort:

1. **External-validity eval (critique #2)** — score a small set of non-Strudel synth
   audio (commercial EDM stems or another renderer's output). Until then, claim only
   "Strudel-rendered timbres". *Accepted; highest priority.*
2. **Class-mapping audit (#7)** — dump per-class reference/prediction event counts and
   a program confusion matrix on the corpus test; explains both the base model's exact
   0.000s and the persistent Piano/Guitar zeros. Cheap (parse of existing predictions).
3. **Drums-excluded metrics (#1)** — report pitched-only multi_f alongside; stop calling
   multi_f "the fairest single number" without support weights.
4. **Leakage audit (#3)** — pattern-similarity dedup between corpus train/test and a
   leave-one-repo-out split for the next run; reframe exposure honestly (~6 passes over
   the strudel pool, not "0.27 epochs").
5. **Seeds & CIs (#5)** — ≥2 more strudel50 seeds; bootstrap CIs over files. Defer all
   fine-grained strudel50-vs-egmd50 orderings until then.
6. **LR-vs-mix (#4)** — accepted: our inference was invalid (both arms had identical
   replay shares). A gentle-LR arm (3e-5) is the cheapest experiment that tests it.
7. **Batch-3/4 stories (#8)** — compute note-density/polyphony stats per batch before
   repeating those explanations.

