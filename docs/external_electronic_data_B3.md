# External labeled electronic data (Track B B3) — evaluation + plan

**Goal:** add labeled audio with *real* synthesizer timbres (subtractive / FM /
wavetable) to break the renderer confound. The base model — and, so far, our
Strudel data — only ever saw a narrow set of timbres (Kontakt samples for the
base; Strudel's default engine for us). We need aligned (audio, note+instrument
label) pairs whose *timbre* is genuinely synthesized and diverse.

Researched 2026-07-15 from primary sources (GitHub, Zenodo, arXiv, Magenta).

## The key realization

For anything we render from MIDI, **the labels are free and perfectly aligned**
— we render *from* the MIDI, so the notes *are* the ground truth. The only real
questions are: (1) does the timbre generator run **headless + offline + batch**
on Colab, and (2) is the MIDI feedstock electronic-rich and licensable. That
reframes B3 from "find labeled audio" to "pick a renderer + a MIDI source."

## Avenue-by-avenue

### A. Render MIDI through real software synths — **the thesis path** ⭐
- **Host: DawDreamer** (Python, GPLv3) — hosts **VST3** instruments, loads a
  whole MIDI file (`synth.load_midi(path, all_events=True)`), renders **offline**
  (`engine.render(seconds)`), writes WAV. Docs claim explicit **Colab** support.
  This replaces the roadmap's assumption of per-synth CLIs — **correction:**
  Surge's `surge-xt-cli` is a *realtime* OSC engine, **not** an offline
  renderer, and RenderMan (VST2, single-note) is superseded. Host the synths as
  VST3 in DawDreamer instead.
- **Synths (all GPL, all ship VST3):** **Surge XT** (subtractive/wavetable/FM,
  ~2000 patches — strongest single pick), **Dexed** (authentic DX7 FM, loads
  real SysEx banks), **Vital** (wavetable; engine is GPLv3 but its **factory
  presets are non-redistributable** — generate/randomize our own patches).
- **fluidsynth + SoundFont** = the low-effort baseline, but an SF2 is *sampled*
  — it reproduces exactly the Slakh weakness we're escaping. Volume baseline
  only, not the differentiator.
- **Yield:** effectively unlimited (compute-bound). **Effort: M** — the work is
  the **GM-program → synth-patch mapping table**, not the render primitive.
- **Fits our pipeline directly:** `scripts/dataset/prepare_lakh.py` already
  filters LMD to electronic tracks and converts labels, with a documented
  plug-in point for "render these MIDIs through actual synths." B3 scaffolds
  that renderer as `scripts/dataset/render_synths.py`.

### B. Existing labeled electronic datasets
- **NES-MDB** ⭐ (MIT) — 5,278 songs / 397 NES games / >2M notes; the `nesmdb`
  Python package **renders WAV headlessly** (VGMPlay) with per-voice note +
  velocity + **timbre** labels. Timbre = pure 2A03 electronic (pulse/triangle/
  noise) — *real synthesized waveforms*, narrow palette. **Cheap, licensed, real
  electronic timbre. Effort: S** — the fastest win.
- **YM2413-MDB** — FM video-game dataset with instrument + emotion labels; *real
  FM* chiptune. Worth evaluating as a second chiptune source. *(label
  granularity / license UNVERIFIED.)*
- Slakh (have it) is sample-based; no real-synth successor exists. AAM is also
  sample-based (no new timbre). BitMIDI / VGMusic are unlicensed — usable only
  as risky MIDI *input* to Avenue A, never as a citable set.

### C. NSynth — auxiliary only
- 305k single notes, 1,006 instruments, **16 kHz mono** (matches our frontend),
  CC BY 4.0; ~196k electronic+synthetic notes incl. a `synth_lead` family (no
  `synth_pad` family — correction to a common assumption). **But** turning
  single static samples into a MIDI renderer just *recreates the Slakh problem*
  (one sample, no modulation). Value is **auxiliary** (timbre embedding /
  augmentation / patch-library seed), not a primary renderer. **Deprioritize.**

### D. Better MIDI feedstock for Avenue A
- **MetaMIDI (MMD)** — 436,631 MIDI files, **143,868 genre-tagged**, CC BY 4.0
  (Zenodo). Genre tags let us select electronic/EDM/techno/house directly, a big
  upgrade over LMD's GM-program heuristic. Successor **GigaMIDI** (HuggingFace)
  may be easier to access. *(current access route UNVERIFIED — verify Zenodo vs.
  request-gate.)* **Effort: S** to adopt as input; it multiplies A's quality.

## Ranked plan

1. **Build Avenue A** (`render_synths.py`, scaffolded here): DawDreamer + Surge
   XT + Dexed (+ Vital) on Colab. De-risk first: confirm the three VST3s
   instantiate **headlessly** (may need `xvfb`) and measure the real-time factor
   on a few tracks; then build the **GM-program → patch map** (the real work).
2. **Feed it MetaMIDI/GigaMIDI** genre-tagged electronic MIDI (CC BY 4.0) rather
   than GM-filtered LMD alone — higher electronic hit-rate.
3. **Add NES-MDB now** (Effort S) as a cheap, licensed, real-electronic set
   while A is built; evaluate YM2413-MDB for FM.

**Deprioritize:** NSynth (auxiliary), fluidsynth/SF2 (sampled baseline),
RenderMan (superseded), BitMIDI/VGMusic (unlicensed).

## Fallback (per roadmap)

If Avenue A stalls on Colab plugin/headless issues, **scale up Strudel
generation (B6)** — but note Strudel is still *one* renderer, so even the
fallback should widen Strudel's own timbre range (more waveforms/FX/patches),
per B4. NES-MDB (B) is the independent-renderer insurance that needs no VST
hosting at all.

## What B3 leaves for execution

- `scripts/dataset/render_synths.py` — DawDreamer-based renderer scaffold with a
  starter `GM_SYNTH_PATCH_MAP`, batch loop, 16 kHz-mono output, and the
  staging→loader-ready file-list promotion that `prepare_lakh.py` expects.
  **Colab-only** (needs DawDreamer + the VST3s); guarded to fail with a clear
  message otherwise.
- Open verifications carried into execution: DawDreamer RTF on Colab; headless
  VST3 load (xvfb?); MetaMIDI access; YM2413-MDB license.
