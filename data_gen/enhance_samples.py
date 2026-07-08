#!/usr/bin/env python3
"""Enhance raw generated Strudel sketches into coherent REPL tracks with an LLM.

The sampler (generate.mjs) draws function chains and content from the corpus
distributions, which is great for coverage but routinely emits incoherent
voices (`note("c5 g5").sound("bd ~")`, `s("bd 0")`, clashing timbres). The old
inspire_from_yaml.py replaced that with a fixed random template — musical, but
it threw the sampled material away.

This instead treats each sketch as a *brief* and asks an LLM to rewrite it into
a real, good-sounding Strudel arrangement that keeps the sketch's character
(sound palette, tempo feel, rhythmic gestures) while fixing what doesn't make
sense. Every candidate is validated against the actual Strudel engine
(data_gen/extract_labels.mjs -> queryArc) and retried with the error text, so
the output YAML only ever contains patterns that really evaluate and are not
silent. Same output shape as the old script, so preprocess_strudel.py consumes
it unchanged.

No API key here -> Claude Code headless (`claude -p`), same as
scripts/midi_to_strudel.py. Runs in parallel and is resumable (finished songs
are re-read from the output file and skipped).

Usage (per batch; default input/output is batch_2):
  python data_gen/enhance_samples.py --batch 2               # enhance one batch
  python data_gen/enhance_samples.py --limit 8 --jobs 2      # smoke test
  python data_gen/enhance_samples.py --model claude-haiku-4-5
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent

SYSTEM = """\
You are a Strudel live-coding expert. Strudel is a JavaScript music REPL.

You are given a ROUGH auto-generated Strudel sketch. It was sampled from real
corpus statistics, so its sound palette and rhythmic gestures are meaningful,
but its voices are often incoherent (clashing timbres, nonsense like
`note("c5").sound("bd")`, `s("bd 0")`, absurd `.slow()`/gains). Rewrite it into
ONE coherent, good-sounding Strudel REPL track.

Rules:
- Keep the sketch's CHARACTER: reuse its synths/drum sounds and tempo feel where
  they make sense; don't just emit a generic template.
- Structure: 3-5 voices, each on its own `$:` line, typically drums + bass +
  lead, optionally hats and/or a pad. Set tempo once with `setcpm(<bpm>/4)`
  (bpm ~90-150).
- Idioms (corpus-typical): drums via `s("bd ~ sd ~").bank("RolandTR909")`
  (or rolandtr808 / linn9000); hats `s("hh*8")` or `s("~ hh ~ hh")`; pitched
  voices via `n("0 3 7 5").scale("<key>:<mode>").s("sawtooth")` shaped with
  `.lpf(...)`, `.resonance(...)`, `.release(...)`, `.room(...)`, `.delay(...)`,
  `.gain(...)`. Sawtooth/square basses and leads are typical.
- Mini-notation only inside the string args: `~` rest, `*n` speed up, `[a b]`
  subgroup, `<a b>` per-cycle, `a@2` elongate.
- One cycle = one bar. Keep gains sane (drums ~.7-.9, hats ~.2, pitched ~.3-.5).
- It MUST evaluate as valid Strudel and must not be silent.

Output ONLY the Strudel code inside a single ```strudel code block, nothing else.\
"""

USER_TEMPLATE = """\
Rough sketch (id {sid}, {voices} voices):

```
{code}```

Rewrite it into a coherent, musical Strudel REPL track following the rules."""

_print_lock = threading.Lock()


def log(msg: str) -> None:
    with _print_lock:
        print(msg, flush=True)


def call_llm(system: str, prompt: str, model: str, timeout: int = 300) -> str:
    """Anthropic SDK if ANTHROPIC_API_KEY is set, else Claude Code headless.

    NOTE: `claude -p` needs the CLI to be logged in (`claude` -> /login). With
    neither an API key nor a login available, use the subagent path instead
    (see data_gen/README.md) — subagents don't need external credentials.
    """
    try:
        import anthropic
        try:
            client = anthropic.Anthropic()
            resp = client.messages.create(model=model, max_tokens=2000, system=system,
                                           messages=[{"role": "user", "content": prompt}])
            return "".join(b.text for b in resp.content if b.type == "text")
        except (anthropic.AuthenticationError, TypeError):
            pass  # no API credentials -> CLI fallback
    except ImportError:
        pass
    r = subprocess.run(
        ["claude", "-p", "--model", model, f"{system}\n\n{prompt}"],
        capture_output=True, text=True, timeout=timeout,
    )
    if r.returncode != 0 or "Please run /login" in r.stdout:
        raise RuntimeError(f"claude CLI unavailable (not logged in / no API key): "
                           f"{(r.stderr or r.stdout).strip()[:200]}")
    return r.stdout


def extract_code(text: str) -> str:
    m = re.search(r"```(?:strudel|javascript|js)?\s*\n(.*?)```", text, re.DOTALL)
    return (m.group(1) if m else text).strip()


def validate(code: str) -> tuple[bool, str]:
    """Evaluate via the real engine (extract_labels.mjs). -> (ok, detail)."""
    r = subprocess.run(
        ["node", str(HERE / "extract_labels.mjs"), "--code", code, "--cycles", "2"],
        cwd=HERE, capture_output=True, text=True, timeout=120,
    )
    if r.returncode != 0:
        err = (r.stderr or r.stdout).strip().splitlines()
        detail = next((l for l in err if re.search(r"Error|not defined|not a function", l)),
                      err[-1] if err else "unknown eval error")
        return False, detail[:200]
    try:
        # stdout carries strudel log lines before the JSON — parse from the first "{"
        n = json.loads(r.stdout[r.stdout.index("{"):])["n_events"]
    except Exception:
        return False, "no parseable label output"
    if n < 4:
        return False, f"too few events ({n}) over 2 cycles — likely silent/empty"
    if n > 2000:
        return False, f"absurd density ({n} events) — likely a runaway pattern"
    return True, f"{n} events"


def enhance_one(song: dict, model: str, attempts: int) -> dict | None:
    sid = song["id"]
    prompt = USER_TEMPLATE.format(sid=sid, voices=song.get("voices", "?"), code=song["code"])
    feedback = ""
    for attempt in range(1, attempts + 1):
        try:
            raw = call_llm(SYSTEM, prompt + feedback, model)
        except Exception as e:
            log(f"  {sid} attempt {attempt}: LLM error: {e}")
            continue
        code = extract_code(raw)
        ok, detail = validate(code)
        if ok:
            voices = sum(1 for ln in code.splitlines() if ln.strip().startswith("$:"))
            log(f"  {sid}: ok ({detail}, {voices} voices, attempt {attempt})")
            return {"id": f"inspired_{int(sid):03d}" if str(sid).isdigit() else f"inspired_{sid}",
                    "source_id": sid, "source_seed": song.get("seed"),
                    "voices": voices, "code": code.rstrip() + "\n"}
        feedback = (f"\n\nYour previous answer did not validate: {detail}\n"
                    f"Fix it and output only the corrected Strudel code block.")
        log(f"  {sid} attempt {attempt}: invalid ({detail})")
    log(f"  {sid}: FAILED after {attempts} attempts")
    return None


def write_yaml(path: Path, songs: list[dict], model: str) -> None:
    lines = ["generator: data_gen/enhance_samples.py",
             "source: dataset/batches/*/sketches.yaml",
             f"model: {model}", f"count: {len(songs)}", "songs:"]
    for s in sorted(songs, key=lambda x: x["id"]):
        lines.append(f"  - id: \"{s['id']}\"")
        lines.append(f"    source_id: \"{s['source_id']}\"")
        lines.append(f"    source_seed: {s['source_seed']}")
        lines.append(f"    voices: {s['voices']}")
        lines.append("    code: |")
        for ln in s["code"].splitlines():
            lines.append(f"      {ln}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def load_done(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    doc = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return {s["source_id"]: s for s in doc.get("songs", [])}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch", type=int, help="enhance dataset/batches/batch_<N>/")
    ap.add_argument("--input", type=Path, help="sketches.yaml (overrides --batch)")
    ap.add_argument("--output", type=Path, help="enhanced.yaml output (overrides --batch)")
    ap.add_argument("--model", default="claude-sonnet-5")
    ap.add_argument("--attempts", type=int, default=3)
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--limit", type=int)
    ap.add_argument("--no-resume", action="store_true")
    args = ap.parse_args()

    batch = args.batch if args.batch is not None else 2
    bd = HERE.parent / "dataset" / "batches" / f"batch_{batch}"
    if args.input is None:
        args.input = bd / "sketches.yaml"
    if args.output is None:
        args.output = bd / "enhanced.yaml"

    songs = yaml.safe_load(args.input.read_text(encoding="utf-8"))["songs"]
    if args.limit:
        songs = songs[: args.limit]

    done = {} if args.no_resume else load_done(args.output)
    todo = [s for s in songs if str(s["id"]) not in done]
    results = dict(done)
    log(f"enhancing {len(todo)} songs ({len(done)} already done) with {args.model}, "
        f"jobs={args.jobs}")

    completed = 0
    with ThreadPoolExecutor(max_workers=args.jobs) as ex:
        futs = {ex.submit(enhance_one, s, args.model, args.attempts): s for s in todo}
        for fut in as_completed(futs):
            src = futs[fut]
            res = fut.result()
            if res:
                results[str(src["id"])] = res
            completed += 1
            if completed % 10 == 0 or completed == len(todo):
                write_yaml(args.output, list(results.values()), args.model)  # checkpoint
                log(f"[{completed}/{len(todo)}] kept {len(results)} total -> {args.output.name}")

    write_yaml(args.output, list(results.values()), args.model)
    failed = len(songs) - len(results)
    log(f"\ndone: {len(results)} enhanced, {failed} unrecoverable, -> {args.output}")


if __name__ == "__main__":
    main()
