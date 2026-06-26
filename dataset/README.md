# `dataset/` — training triples

Each sample is an aligned triple produced from one source Strudel pattern:
**(audio WAV, MIDI/events, Strudel code)**. Storage is split by size:

| Path                   | Tracked by | Notes                                            |
| ---------------------- | ---------- | ------------------------------------------------ |
| `code/{id}.js`         | **git**    | the source pattern string                        |
| `midi/{id}.mid`        | **git**    | rendered MIDI                                     |
| `events/{id}.json`     | **git**    | haps + synth params used                          |
| `manifest.jsonl`       | **git**    | one row per sample → all artifacts + params + split |
| `audio/{id}.wav`       | **DVC**    | 16 kHz mono renders → Google Drive (GB-scale)    |

Small symbolic artifacts live directly in git. The **heavy WAV audio** is stored
in Google Drive via **DVC** — only the `dataset/audio.dvc` pointer file is
committed. See [../docs/dvc.md](../docs/dvc.md) for setup and the
push/pull workflow.

## Quick reference

```bash
# after WAV renders exist (Phase 3+):
dvc add dataset/audio                      # creates dataset/audio.dvc + .gitignore entry
git add dataset/audio.dvc dataset/.gitignore
git commit -m "Track audio renders with DVC"
dvc push                                   # upload WAVs to Drive

# on another machine / in Colab:
git clone --recursive <repo> && cd <repo>
dvc pull                                   # download WAVs from Drive
```
