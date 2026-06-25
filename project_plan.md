# Restrudel — Project Plan

**Goal:** Build a pipeline that takes an mp3 file and produces editable **Strudel REPL code** that reproduces it, with a focus on **electronic/synth-heavy music** where existing transcribers (YourMT3+, etc.) fail.

```
mp3 ─▶ preprocessing ─▶ spectrogram ─▶ transformer (AMT) ─▶ MIDI ─▶ LLM / rules ─▶ Strudel code
```

---

## 1. Reference model analysis: YourMT3+

Source: *YourMT3+: Multi-instrument Music Transcription with Enhanced Transformer
Architectures and Cross-dataset Stem Augmentation* (Chang et al., MLSP 2024) —
arXiv:2407.04822.

### 1.1 Input representation (Q1)
The model does **not** consume raw mp3/waveform. The front end is:

1. Decode + resample audio to **16 kHz mono**.
2. Segment into **2.048 s** windows.
3. Compute a **log-magnitude spectrogram** per segment:
   - `YMT3` baseline: **log-mel**, 256 time steps × 512 mel bins.
   - `YPTF` ("+") variant: **linear log-magnitude**, 110 time steps × 1,024 freq
     bins, then a **2D ResNet pre-encoder** → feature map (c=f′=128).
4. The transformer **encoder** reads this spectrogram feature sequence.
   Enhancements over MT3: spectral cross-attention (attends across frequency,
   not just time), hierarchical time–frequency attention, mixture-of-experts.

**Takeaway:** input = spectrogram, fixed 16 kHz / 2.048 s framing.

### 1.2 Output representation & targets (Q2)
- **Output** = a **sequence of MIDI-like event tokens**, *not* a raw `.mid` blob:
  `note onset / shift / offset` tokens, `program` (instrument) tokens, time
  tokens. Vocabularies: `MT3_FULL_PLUS` (train), `MT3_MIDI_PLUS` (eval).
  Programs 100/101 reserved for singing-voice melody/chorus.
- **Training target** = those tokens, generated **from** ground-truth MIDI.
- At inference, predicted tokens are **decoded back to a MIDI file**.
- So the learning problem is **seq2seq**: spectrogram features → event tokens.
  The MIDI file is the source/sink of the tokens, not the direct regression
  target.

### 1.3 Training/test data & synthesis (Q3)
- **Train:** MAESTRO (piano), **Slakh2100** (synthetic multi-instrument),
  GuitarSet, MusicNet-EM, URMP, ENST-Drums, EGMD, MIR-ST500, SMT-Bass, CMedia.
- **Test:** above + MAPS, RWC-Pop (author-refined annotations).
- **"Synthetic" = MIDI rendered through SAMPLE-BASED virtual instruments**
  (Slakh = Lakh MIDI rendered with professional *sampled* instruments: pianos,
  guitars, drums, orchestral). **No subtractive / FM / wavetable SYNTHESIZER
  rendering.** They did **not** generate synth-based electronic songs.
- **Augmentation** = "stem augmentation" only: intra-stem instrument dropout
  (Bernoulli p≈0.7) + cross-dataset stem mixing. No new timbres are synthesized.

### 1.4 Why it fails on electronic music (the gap we exploit)
The paper itself states *"relying solely on synthetic datasets is insufficient
for modeling the diverse timbres of pop music"* and reports **<10%** accuracy on
non-main pop instruments. Root cause: training timbres are **sampled acoustic
instruments**, so the model never learns the evolving, detuned, heavily-effected
spectra of subtractive/FM/wavetable synths.

**Our core hypothesis:** building a training set by **rendering MIDI through real
synthesizers** (and through Strudel's own engine) will close this gap for
synth-heavy electronic music.

---

## 2. Problem definition & scope

- **In:** a single mp3 (later: any common audio).
- **Out:** Strudel REPL code that is (a) audibly close and (b) human-editable.
- **Primary domain:** electronic music with prominent synth lines, bass, drums.
- **Success ≠ perfect transcription.** Target a useful *starting point* a user
  refines in the REPL.

### Open scoping decisions (resolve before building)
- [ ] **Fidelity target:** note-level pitch/rhythm only, or also timbre/FX
      (filter cutoff, envelope, reverb) mapped to Strudel params?
- [ ] **Polyphony / multi-instrument** from day one, or start monophonic
      (single synth lead or bass) to de-risk?
- [ ] **Train our own AMT model** vs. **fine-tune YourMT3+** vs. **reuse
      YourMT3+ as-is** and focus effort on the MIDI→Strudel stage first?

---

## 3. Pipeline stages

### Stage 0 — Preprocessing
- Decode mp3 → 16 kHz mono (match AMT front end).
- **Source separation** (already prototyped: Demucs `htdemucs` →
  bass/drums/other/vocals in `separated/`). Transcribe stems independently to
  reduce polyphony and isolate the synth ("other") stem.
- Optional: loudness norm, trim silence, tempo/downbeat estimation (helps
  quantization in Stage 3).

### Stage 1 — Audio → model input (spectrogram)
- Replicate a known-good front end (log-mel or linear log-mag, 16 kHz,
  ~2 s segments) so we can plug into / compare against YourMT3+.

### Stage 2 — Spectrogram → MIDI (the AMT transformer)
- Baseline: run **YourMT3+ off-the-shelf**, measure failure modes on our
  electronic test clips (establishes the bar to beat).
- Improvement path: **fine-tune / retrain** on synth-rendered data (Section 4).

### Stage 3 — MIDI → Strudel code
- Two candidate approaches (evaluate both):
  1. **Rule-based / deterministic transpiler:** MIDI notes+timing → Strudel
     mini-notation (`note("...")`), drums → `s("bd hh ...")`, quantize to a
     grid, map programs → Strudel sounds/synths.
  2. **LLM-based:** prompt an LLM with the MIDI (or a structured note list) +
     Strudel syntax/examples → emit code. More flexible for idiomatic patterns,
     needs guardrails + a validity check (run through Strudel to confirm it
     parses/plays).
- Likely **hybrid**: deterministic skeleton, LLM for idiomatic cleanup.

---

## 4. Data strategy (our differentiator)

The whole point: **create synth-based training data** that YourMT3+ lacks.

1. **MIDI source:** Lakh / electronic-genre MIDI; or procedurally generate
   patterns (basslines, arps, leads, chords) that resemble electronic music.
2. **Render through real synths** to get paired (audio, MIDI):
   - VST/soft-synths via headless renderer (e.g. Surge XT, Vital, Dexed/FM,
     SoundFonts) — many presets per note to cover timbral variety.
   - **Strudel/SuperDirt/Tidal engine itself** — gives audio whose ground truth
     is *already Strudel code* (free Stage-3 labels, not just MIDI!).
   - Randomize: oscillator type, filter cutoff/resonance, ADSR, detune, FX,
     velocity, tempo → maximize timbral coverage (domain randomization).
3. **Augment:** stem mixing (à la YourMT3+) but across **synth** stems; add
   noise, reverb, sidechain, bitcrush to mimic production.
4. **Real eval set:** a small, hand-labeled set of real electronic tracks (or
   tracks you produce where you own the MIDI) to measure real-world transfer.

> Strudel-rendered data is strategically valuable: it bypasses the MIDI→code
> ambiguity for part of the dataset because the label *is* the code.

---

## 5. Evaluation
- **AMT metrics:** note-level F1 (onset, onset+offset, multi-instrument) via
  `mir_eval`, computed specifically on synth/electronic clips.
- **End-to-end:** does generated Strudel code (a) parse, (b) play, (c) sound
  close — perceptual A/B and a spectral-distance metric (audio of generated
  code vs. original stem).
- **Baseline:** YourMT3+ as-is vs. our fine-tuned model on the same electronic
  test set.

---

## 6. Milestones
1. **M1 — Baseline & bar:** Run YourMT3+ on 5–10 electronic clips; document
   failures quantitatively. Stand up Stage 0 (have Demucs already).
2. **M2 — MIDI→Strudel transpiler:** Deterministic + LLM prototypes; validate
   output plays in REPL. (Testable independent of the AMT model.)
3. **M3 — Synth data generator:** Headless render MIDI→audio through ≥2 synths
   incl. Strudel engine; produce first paired dataset.
4. **M4 — Fine-tune AMT** on synth data; re-measure vs. M1 baseline.
5. **M5 — End-to-end demo:** mp3 → Strudel code on held-out electronic track.

---

## 7. Key open questions / risks
- [ ] Reuse YourMT3+ vs. train from scratch (compute budget?).
- [ ] How much timbre/FX to recover vs. just notes (Section 2).
- [ ] MIDI→Strudel: rule-based, LLM, or hybrid — and how to verify correctness.
- [ ] Domain gap: do synth renders transfer to *real* produced tracks (mastering,
      layering, sidechain)? Mitigate with realistic augmentation + real eval set.
- [ ] Strudel coverage: which sounds/synths/effects in Strudel can we actually
      target, and can we render Strudel headlessly at scale for data gen?

---

## 8. Current repo state
- `mp3s/` — sample inputs (Für Elise, Vlinderen).
- `separated/htdemucs/...` — Demucs separation already working (Stage 0 started).
- `notebooks/` — Colab AMT notebook (see README badge).
- `.gitignore` — excludes heavy artifacts (`separated/`, `midi_out/`, `*.wav`).
