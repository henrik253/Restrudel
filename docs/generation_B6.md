# Train-side generation & augmentation (Track B B6)

Implements the B4 strategy on the **train side only** (post-B5 split): the test
repos contribute nothing, and the generator samples only the train-side
distributions recomputed in B5. What landed here is the tooling + local
verification; the at-scale validated run (needs the Strudel engine + offline
render + Drive) is a Colab step, recipe below.

## What was built (+ verified locally)

**S1 — timbre-coverage sampler** (`data_gen/generate.mjs --timbre-coverage`).
Notes/rhythm/functions still come from the corpus distribution; **timbre is
decoupled**:
- FX/filter/envelope params (`lpf/cutoff/hpf/resonance/attack/decay/sustain/
  release/room/delay/distort/crush/coarse/fm/vib/...`) are drawn to **span**
  their range (log-uniform for frequencies), with 10% pushed to an extreme
  (over-sample rare configs), 85% of the time (15% stays corpus-grounded).
- Synth voices (pitched, no explicit sound) get a **uniformly-chosen waveform**
  from a deliberately non-saw-heavy set → breaks sawtooth dominance.
- *Verified:* over 40–60 songs, `.s()` waveforms spread across 7 types (vs.
  sawtooth-dominant); `lpf` spans 111–1859+ instead of clustering.

**S2 — audio-domain augmentation** (`scripts/dataset/augment_audio.py`).
Post-render, **strictly time-preserving** chain (gain, EQ tilt, saturation,
compression, bitcrush, sample-&-hold decimation, short reverb w/ tail truncated,
peak-limit) so the same notes are heard through many processing chains — real
mp3s aren't clean renders. *Verified:* variants keep exact length, stay finite/
non-silent, differ meaningfully (mean |Δ| 0.04–0.07), and **onsets stay within
±50 ms** of the originals (labels remain aligned). numpy/scipy; `pedalboard`
used if present.

**S3 — drum-bank rotation** (in `generate.mjs`, coverage mode). Drum voices with
no bank get one of 8 machines (909/808/707/LinnDrum/…) → breaks the 909/808
memorization the critique flagged. *Verified:* banks rotate evenly.

Example coverage output (seed 314):
```
$: note("e1 ~ ~").decay(.432).sustain(.906).delay(.743).s("square")
$: s("bd hh*4").gain(.8).room(.6).bank("RolandTR707")
$: note("c2 f2 bb4 ...").lpf(1162).lpq(19.934).cutoff(4319).s("supersaw")
$: note("b4 eb4 g4 bb4").s("fm")
```

## Not done here (Colab / at-scale) — and why

- **Validity gate + scale.** `data_gen/generate.mjs` runs locally, but the
  gate (`strudel_eval.mjs`, needs `@strudel/*`) and the offline renderer
  (`node-web-audio-api`) aren't installed here, so no unvalidated batch is
  committed (B1 just purged untrusted data — we don't re-add any). Run at scale
  in Colab.
- **LLM-enhance step.** B4 repurposed it from "improve music" to "diversify
  timbre/FX" and **gated it on an ablation** — and S1 already delivers timbre
  diversity without an LLM, so it's optional, not on the critical path. The user
  asked to use **codex** for it; `codex` is **not installed** on this machine
  (verified 2026-07-15). `data_gen/enhance_samples.py` remains the pluggable hook
  (`npm i -g @openai/codex` to enable), but B6 does not depend on it.

## Full run recipe (Colab, train-side only)

```bash
# 1. generate train-side sketches with timbre coverage (S1+S3)
node data_gen/generate.mjs --n 500 --seed 1 --temp 0.2 --timbre-coverage \
     --yaml dataset/batches/batch_1/sketches.yaml
# 2. (optional, gated) LLM-diversify timbre/FX — needs codex or anthropic key
#    python data_gen/enhance_samples.py --batch 1 --llm codex
#    python data_gen/collate_enhanced.py --batch 1
# 3. render + label + index (writes 16 kHz WAV to Drive, .npy labels, file lists)
python scripts/dataset/preprocess_strudel.py --data-home $DATA_HOME
#    -> corpus TRAIN only enters train/val; TEST_REPOS held out (B5)
# 4. audio-domain augmentation (S2): N variants per rendered clip
python scripts/dataset/augment_audio.py \
     --render-dir $DATA_HOME/strudel_yourmt3_16k --n 1
#    -> add the *_aug*.wav as extra train entries (test set stays un-augmented)
```

Ablations for B8 to measure (per B4): coverage-on vs. corpus-sampled; S2 on vs.
off; LLM-enhance on vs. off — each on the external electronic eval.

## Constraints honored

- **Train-side only:** generation reads the B5 train-side distributions; the two
  test repos never enter generation or augmentation.
- **Labels stay aligned:** S2 is strictly time-preserving; S1/S3 change symbolic
  content *before* labeling, so the labeler re-derives correct labels.
