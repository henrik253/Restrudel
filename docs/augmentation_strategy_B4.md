# Generation & augmentation strategy — critical review (Track B B4)

**Question posed:** is "analyze the corpus, sample from its distribution" a good
way to generate training data — or should we change it? **Decision: change the
axis we sample on.** Keep distribution-sampling for the *symbolic* pattern
(notes/rhythm should look like real music), but **stop sampling timbre from the
corpus distribution** — deliberately *cover* the synth/FX space instead — and
**add an audio-domain augmentation stage** that today does not exist. Rationale
below, then the concrete spec B6 implements.

## The lens: what actually makes this model fail

B0 established the failure precisely. YourMT3+ hears notes fine (onset_f 0.44 on
our corpus) but mis-attributes instruments, because its only synth-timbre
experience was ~26 static Kontakt patches → it collapses 0.82→0.02 F1 the moment
the timbre leaves that set. The generalization axis is **timbre**, and
secondarily **audio realism** (clean renders vs. mastered mp3s). It is *not*
symbolic musical realism — a transcription model maps audio→notes; it does not
need the note stream to be a good *song*, it needs the audio→label mapping to be
learned across the timbres and mixes it will meet.

That single observation reprioritizes everything:

| axis | matters for this model? | current strategy | verdict |
|---|---|---|---|
| **timbre coverage** | **critical** (the whole thesis) | samples sounds from corpus dist → sawtooth-dominant | **BROKEN — recreates Slakh's trap** |
| **audio realism** | **high** (real mp3s are mastered) | clean Strudel renders only | **MISSING — add augmentation** |
| label correctness | critical | perfect by construction | keep |
| note/rhythm realism | low–medium | Markov + content models | keep, don't over-invest |
| mini-notation structure | low | flat sequences | fine to leave |

## Answers to the four B4 questions

**1. Distribution-sampling reproduces corpus bias — coverage or realism?**
**Split the decision by axis.** For *notes/rhythm/functions*: keep sampling from
the corpus distribution (cheap realism, keeps patterns valid, gives the decoder
a sensible note-language prior). For *sound/synth/FX selection*: **switch to
coverage** — sample timbre parameters (waveform, filter cutoff/resonance,
ADSR, detune/unison, FX) to *span* the space, deliberately **over-sampling rare
configurations** the corpus underrepresents. Mirroring the corpus here is the
exact mistake that gave Slakh 26 patches; our renewable generator should instead
*maximize timbre entropy* while keeping labels perfect. This is the single
highest-leverage change in Track B.

**2. Markov chains are structurally flat — does structure matter?**
**No, not much — do not invest here.** Structural richness of the *symbolic*
pattern (nested `[]`, `<>`, euclid) barely affects an audio→note model as long
as the resulting note events are plausible and the audio is diverse. Leave the
content models as-is. (One caveat: extreme note density/polyphony *does* change
the audio difficulty — so vary **density** as an explicit knob, but not
mini-notation syntax for its own sake.)

**3. LLM-enhancement changed the distribution unmeasured — keep/drop/measure?**
**Repurpose and measure.** As previously used ("make it a richer song") it moved
the distribution in unmeasured ways for a musical-quality goal we just argued is
low-value. Two changes: (a) **redirect** the LLM from "improve the music" to
"**diversify the timbre/FX**" — vary sounds, filters, effects, banks — which
serves the actual lever; (b) **measure** it: an ablation in B6/B8 (raw-sketch
vs. LLM-diversified) on the external eval decides whether it earns its place.
Until measured, it is optional, not on the critical path.
*(Tooling note: the user asked to use the `codex` GPT model for this. codex is
now installed (codex-cli 0.144.4); B6 wires it as a backend in
`enhance_samples.py` (`--model codex`, via `codex exec`). Still optional/gated —
the pipeline does not block on it.)*

**4. Missing audio-domain augmentation — add it?**
**Yes — this is the second-biggest win and it's cheap.** Today the training
audio is pristine Strudel renders; real uploads are compressed, EQ'd, reverbed,
limited, stereo-imaged, lossy. A **post-render augmentation chain** closes that
gap without touching the labels (time-preserving effects only). Bonus: it
sidesteps the `node-web-audio-api` AudioWorklet-FX gap (crush/distort/coarse
don't load in the offline renderer) by applying those colorations in Python
*after* render. And it directly attacks the renderer confound — the same notes
heard through many different processing chains.

## The improved strategy (what B6 implements)

**S1 — Timbre-coverage sampler (decouple sound from the corpus dist).**
Extend `data_gen/generate.mjs`: after the note/function chain is built, assign
sound + synth params from a **coverage sampler**, not the corpus frequencies.
Sweep/randomize: waveform (`sawtooth/square/triangle/sine/supersaw/fm`), `lpf`
cutoff + `resonance`, `attack/decay/sustain/release`, `vib`/`detune`/unison,
and FX (`room/delay/crush/distort/coarse/vowel`). Keep it musically bounded
(ranges from the corpus, but sampled ~uniformly across them, with extra mass on
rare combos). Record the drawn params per song (already dumped by the labeler)
for later stratified eval.

**S2 — Audio-domain augmentation (new stage, post-render).**
A Python pass over each rendered 16 kHz WAV applying a randomized, **strictly
time-preserving** chain so labels stay aligned: peak/RMS gain, EQ tilt,
compression/limiting, saturation/soft-clip, bitcrush/decimate, short room/plate
reverb, light stereo→mono-fold coloration, and optional MP3 re-encode round-trip
(lossy artifacts). Prefer `pedalboard` (Spotify, Colab-friendly) with a
`numpy`/`scipy` fallback. N augmented variants per clean render multiplies data
cheaply. Forbidden: any time-stretch/pitch-shift/reverb-tail that would move or
smear onsets past the ±50 ms tolerance (would corrupt labels).

**S3 — Drum-bank diversification.**
Rotate drum sample banks (breaking TR-909/808 memorization the critique flagged)
and, where B3's real-synth renderer lands, route drums through varied kits.

**S4 — Keep** the corpus-distribution sampler for notes/functions, the validity
gate (must eval + render non-silent), and seeded reproducibility. **Drop** the
"musical improvement" framing of LLM-enhance; **gate** its return on the S1/S2
ablation.

## Priority for B6

1. **S2 audio augmentation** — cheapest, largest realism gain, testable locally
   (pure DSP, no Colab/synths). Do first.
2. **S1 timbre-coverage sampler** — the thesis lever; moderate effort in
   `generate.mjs`.
3. **S3 drum-bank rotation** — small.
4. **S1+S2 vs. baseline ablation** wired for B8 to measure; LLM step optional.

All of S1–S3 apply to **train-side sources only** (post-B5 split); the test set
stays pristine, un-augmented real corpus.
