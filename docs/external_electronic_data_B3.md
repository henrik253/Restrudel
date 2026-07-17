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
- **NES-MDB** ⭐ (MIT) — 5,278 songs / 397 NES games / >2M notes; per-voice note
  + velocity + **timbre** labels. Timbre = pure 2A03 electronic (pulse/triangle/
  noise) — *real synthesized waveforms*, narrow palette. **Cheap, licensed, real
  electronic timbre. Effort: S** — the fastest win.
  *Execution corrections (verified against the real release, 2026-07-16):*
  distribution is **Google Drive** (the old GitHub-releases URL 404s;
  sha256-verified in `prepare_nesmdb.py`); the MIDI tarball ships the
  **official game-level train/valid/test split as directories** (4502/403/373 —
  never re-split); tracks are named p1/p2/tr/no with programs **80/81 (Synth
  Lead) / 38 (Synth Bass — the class Slakh dropped)** and the noise voice
  already on **channel 9** (drums via `ch_9_as_drum=True`; its pitches are the
  2A03's 16 noise periods, remapped to GM kick/snare/hat). The `nesmdb` pip
  package is **Python-2-only** — audio comes from the **Raw VGM release +
  `vgm2wav`** instead (see `prepare_nesmdb.py`).
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

## De-risk spikes (executed 2026-07-17, local macOS — no Colab needed)

- **DawDreamer + Surge XT: PASSED.** `dawdreamer` pip-installs into the venv;
  Surge XT 1.3.4 VST3 extracted from the official pkg into
  `~/Library/Audio/Plug-Ins/VST3` (user dir, no sudo) + factory data into
  `~/Library/Application Support/Surge XT`. Headless plugin load 1.6 s,
  offline render of a real MIDI at **136× realtime**, non-silent — no xvfb.
  Caveat confirming the plan's "patch map is the real work": `load_preset`
  with Surge's `.fxp` returns False under VST3 (that API expects VST2 fxp) —
  patch selection needs the VST3 state/parameter route in `render_synths.py`.
- **NES-MDB VGM render: PASSED with one correction.** `vgm2wav` comes from
  **ValleyBell/libvgm** (not vgmtools), builds with CMake; renders ~0.3 s per
  song. First-onset alignment vs. the MIDI labels: 0 to −30 ms over the
  spike sample (within mir_eval's ±50 ms). **VGMs loop** — the render must be
  truncated to the label duration or up to ~49 s of unlabeled audio per song
  poisons training (handled in `prepare_nesmdb.py`).
- **GigaMIDI: BLOCKED on an operator step.** The HF dataset is gated;
  fetching requires an authenticated account that accepted its terms
  (`hf auth login` + accept at huggingface.co/datasets/Metacreation/GigaMIDI).

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
