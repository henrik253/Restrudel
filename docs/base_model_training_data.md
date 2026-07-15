# What the base YourMT3+ model actually trained on (synth content)

Research 2026-07-15, from primary sources (HF Space code, Slakh generation
repo, arXiv 2407.04822v3, and label files in our own Drive Slakh copy).
Purpose: pin down the base model's synth exposure — labels vs. timbres — so
Track B claims and data decisions rest on verified ground.

## Training datasets (released checkpoint, preset `all_cross_final`)

Slakh2100 (0.295), MusicNet-EM (0.19), MIR-ST500 vocals (0.191), MAESTRO
(0.1), URMP (0.1), ENST-Drums (0.05), CMedia vocals (0.05), GuitarSet (0.01),
IDMT-SMT-Bass (0.01), E-GMD (0.004) — weights = sampling mix.
*(Caveat: the author published this command for the `b80_ps2` sibling
checkpoint; same preset for our `b36_nops` variant is inferred, unverified.)*

## The three-way answer: did it see synths?

1. **Labels in the vocabulary — YES.** `mc13_full_plus_256` has dedicated
   Synth Lead (GM 80–87) and Synth Pad (88–95) decoder channels/classes.
   **Synth Bass (38–39) is mapped into "Electric Bass"** — no separate class.
2. **Labels in training targets — PARTIALLY.** Slakh is the *only* source of
   synth-programmed notes: Synth Lead ≈ 1.5–2.2% of stems, Synth Pad ≈ 4.4–4.8%
   (≈0.6%/1.3% of overall exposure after the 0.295 mix weight).
   **Synth Bass: never** — Slakh's `komplete_strict.json` had no patch for GM
   38–39 and `render_by_instrument.py` skipped those stems entirely (verified:
   27/27 synth-bass stems in metadata have `audio_rendered: false`, and the
   programs are absent from the YourMT3 `_notes.npy` label files). Synth Brass
   (62–63) and all FX/Ethnic/SFX classes (96–127) were skipped the same way.
3. **Synth timbres in audio — NARROW, SAMPLE-BASED ONLY.** Every synth-class
   stem was rendered by **Kontakt Player 6 sample playback** (Komplete 12): 14
   lead patches + 12 pad patches (`.nkm` multis like `pimped_analog_saw`,
   `poly_detuned_lead`) — static samples, no live filter/mod behavior. **No
   subtractive/FM/wavetable engine (Massive, FM8, Monark, …) rendered a single
   note anywhere in training.** E-GMD adds genuine electronic *drum-module*
   timbres (Roland TD-17 kits incl. 808/909 emulations) — drum labels only.
   The vocal datasets contribute only Spleeter-separated vocal stems in this
   preset (pop-synth accompaniment reaches the model only as separation bleed).

## The base model's own numbers prove the cliff

From the checkpoint's bundled eval (`result_..._eval_final.json`):

| eval set | Synth Lead F1 | Synth Pad F1 | context |
|---|---|---|---|
| Slakh test (same 26 Kontakt patches as training) | **0.820** | 0.413 | in-domain |
| RWC-Pop (real commercial recordings) | **0.023** | 0.009 | out-of-domain |

The paper (§5.2, conclusion) attributes the pop collapse to "reliance on
synthetic datasets" that "may not fully cover the diverse timbres of pop
music." Electronic music / synthesizers are never specifically addressed.

## Consequences for Restrudel

- **Corrected thesis wording** (the old "never saw a synthesizer" was half
  wrong): *the base model's entire synth-timbre experience is ~26 static
  sampled Kontakt patches; nothing live-synthesized, and no synth bass at all —
  and its synth-class F1 collapses 0.82 → 0.02 the moment the timbre leaves
  that patch set.* Our corpus benchmark (Slakh Synth Lead 0.733 vs. Strudel
  0.000 for base) measured the same cliff from the other side.
- **Bass 0.000 explained:** base never saw a synth-bass note (labels or audio);
  our Strudel basses are far outside its "Electric Bass" sample experience.
- **Timbre-diversity is the lever, and Slakh is the cautionary tale:** 26
  static patches ⇒ 0.02 F1 on real music. If we fine-tune on *one* renderer's
  default timbres (Strudel), we inherit the same failure mode one renderer
  over — this is why Track B's data steps emphasize renderer/timbre diversity,
  not just more Strudel.
