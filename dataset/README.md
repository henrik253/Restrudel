# `dataset/` — training triples

Each sample is an aligned triple produced from one source Strudel pattern:
**(audio WAV, MIDI/events, Strudel code)**. Storage is split by size:

| Path                   | Tracked by | Notes                                            |
| ---------------------- | ---------- | ------------------------------------------------ |
| `code/{id}.js`         | **git**    | the source pattern string                        |
| `midi/{id}.mid`        | **git**    | rendered MIDI                                     |
| `events/{id}.json`     | **git**    | haps + synth params used                          |
| `manifest.jsonl`       | **git**    | one row per sample → all artifacts + params + split |
| `audio/{id}.wav`       | **Google Drive** | 16 kHz mono renders (GB-scale), synced separately |

Small symbolic artifacts live directly in git. The **heavy WAV audio** is stored
in Google Drive and kept out of git; the exact sync mechanism is still to be
decided (DVC was scaffolded then removed as unused).
