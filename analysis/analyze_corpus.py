#!/usr/bin/env python3
"""Phase 1 corpus analysis: extract Strudel patterns from the fetched corpus and
measure which sounds / synths / effects real songs actually use.

Outputs CSV tables + PNG plots to analysis/out/ and prints a summary.
Run:  python3 analysis/analyze_corpus.py
"""
import os, re, json, hashlib, collections
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORPUS = os.path.join(ROOT, "corpus", "sources")
OUT = os.path.join(ROOT, "analysis", "out")
os.makedirs(OUT, exist_ok=True)

EXTS = (".js", ".mjs", ".mdx", ".md", ".txt")
# A snippet must look like a *played* pattern, not library source.
PLAY_IDIOM = re.compile(r"(\$:|setcps?\(|setcpm\(|\bstack\s*\(|\bnote\s*\(|\bsound\s*\(|\.s\s*\(|\bs\s*\(\s*[\"'`])")
# Skip obvious library/build files.
SKIP_PATH = re.compile(r"(node_modules|/dist/|/build/|\.test\.|/krill|/parser|packages/.*/src/)", re.I)

# Sound-classification heuristics.
WAVEFORMS = {"sine","sawtooth","saw","square","triangle","pulse","supersaw"}
NOISE = {"white","pink","brown","crackle","noise"}
DRUMS = {"bd","sd","sn","hh","oh","ch","rim","cp","cr","rd","lt","mt","ht","perc",
         "tom","clap","kick","snare","hat","ride","crash","click","misc"}

def classify(name):
    n = name.lower()
    if n in WAVEFORMS: return "waveform-synth"
    if n in NOISE: return "noise"
    if n.startswith("gm_"): return "soundfont(gm)"
    if n.startswith("z_"): return "zzfx-synth"
    if n in DRUMS: return "drum-sample"
    return "other-sample"

# --- snippet extraction -----------------------------------------------------
def extract_snippets(path, text):
    """Yield (snippet_text) candidates from one file."""
    ext = os.path.splitext(path)[1].lower()
    found = []
    if ext in (".mjs", ".js"):
        # exported template-literal tunes: export const X = `...`
        for m in re.finditer(r"=\s*`(.*?)`", text, re.S):
            found.append(m.group(1))
    if ext in (".mdx", ".md"):
        # fenced code blocks (``` ... ```), language tag optional
        for m in re.finditer(r"```[a-zA-Z]*\n(.*?)```", text, re.S):
            found.append(m.group(1))
    # whole-file fallback for plain pattern files
    if not found and ext in (".js", ".mjs", ".txt"):
        found.append(text)
    # keep only snippets that look like played patterns
    return [s for s in found if PLAY_IDIOM.search(s) and 15 < len(s) < 20000]

# --- per-snippet feature extraction -----------------------------------------
SOUND_CALL = re.compile(r"(?:\bsound|\.?\bs)\s*\(\s*[\"'`]([^\"'`]*)[\"'`]", re.S)
BANK_CALL = re.compile(r"\.bank\s*\(\s*[\"'`]([^\"'`]+)[\"'`]")
METHOD = re.compile(r"\.([a-zA-Z_]\w*)\s*\(")
CPS = re.compile(r"setcp[sm]\s*\(\s*([0-9.]+)")
# mini-notation token = a sound name, possibly with :index; strip operators.
TOKEN = re.compile(r"[A-Za-z_][A-Za-z0-9_.]*")

def sound_tokens(arg):
    out = []
    for tok in TOKEN.findall(arg):
        base = tok.split(":")[0].split(".")[0]
        if base and base != "_" and not base.isdigit():   # "_"/"~" are rests
            out.append(base)
    return out

def analyze(snippet):
    sounds = collections.Counter()
    for arg in SOUND_CALL.findall(snippet):
        for s in sound_tokens(arg):
            sounds[s] += 1
    banks = collections.Counter(b.lower() for b in BANK_CALL.findall(snippet))
    methods = collections.Counter(METHOD.findall(snippet))
    return sounds, banks, methods

# --- walk corpus ------------------------------------------------------------
def main():
    snippets, seen = [], set()
    files_scanned = 0
    for dirpath, _, files in os.walk(CORPUS):
        if "/.git" in dirpath: continue
        for fn in files:
            if not fn.endswith(EXTS): continue
            p = os.path.join(dirpath, fn)
            rel = os.path.relpath(p, CORPUS)
            if SKIP_PATH.search("/" + rel): continue
            try:
                text = open(p, encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            files_scanned += 1
            for snip in extract_snippets(p, text):
                h = hashlib.md5(re.sub(r"\s+", "", snip).encode()).hexdigest()
                if h in seen: continue   # dedup across forks
                seen.add(h)
                snippets.append((rel, snip))

    sound_total = collections.Counter()      # raw occurrences
    sound_snip = collections.Counter()       # # snippets using it (breadth)
    bank_total = collections.Counter()
    method_snip = collections.Counter()
    cat_total = collections.Counter()
    cps_values = []

    for rel, snip in snippets:
        sounds, banks, methods = analyze(snip)
        for s, c in sounds.items():
            sound_total[s] += c
            sound_snip[s] += 1
            cat_total[classify(s)] += c
        bank_total.update(banks)
        for meth in set(methods):           # presence per snippet
            method_snip[meth] += 1
        for v in CPS.findall(snip):
            try: cps_values.append(float(v))
            except ValueError: pass

    # --- write tables -------------------------------------------------------
    def save_counter(counter, cols, fname, extra=None):
        rows = []
        for k, v in counter.most_common():
            row = {cols[0]: k, cols[1]: v}
            if extra: row.update(extra(k))
            rows.append(row)
        df = pd.DataFrame(rows)
        df.to_csv(os.path.join(OUT, fname), index=False)
        return df

    sounds_df = save_counter(
        sound_total, ["sound", "occurrences"], "sounds.csv",
        extra=lambda k: {"snippets": sound_snip[k], "category": classify(k)})
    save_counter(bank_total, ["bank", "occurrences"], "banks.csv")
    save_counter(method_snip, ["function", "snippets_using"], "functions.csv")
    save_counter(cat_total, ["category", "occurrences"], "categories.csv")

    summary = {
        "files_scanned": files_scanned,
        "unique_snippets": len(snippets),
        "unique_sounds": len(sound_total),
        "snippets_with_tempo": len(cps_values),  # raw setcps/setcpm; unit varies
        "category_breakdown": dict(cat_total.most_common()),
    }
    json.dump(summary, open(os.path.join(OUT, "summary.json"), "w"), indent=2)

    # --- plots --------------------------------------------------------------
    def barplot(df, label_col, value_col, title, fname, top=25, color="#4C72B0"):
        d = df.head(top).iloc[::-1]
        plt.figure(figsize=(9, max(4, 0.32*len(d))))
        plt.barh(d[label_col].astype(str), d[value_col], color=color)
        plt.title(title); plt.xlabel(value_col); plt.tight_layout()
        plt.savefig(os.path.join(OUT, fname), dpi=120); plt.close()

    if len(sounds_df):
        barplot(sounds_df, "sound", "occurrences",
                f"Top sounds used (of {len(sound_total)} unique)", "top_sounds.png")
        barplot(sounds_df.sort_values("snippets", ascending=False),
                "sound", "snippets", "Sounds by breadth (# patterns using)",
                "sounds_by_breadth.png", color="#55A868")

    if cat_total:
        cats = pd.DataFrame(cat_total.most_common(), columns=["category", "occurrences"])
        plt.figure(figsize=(7, 4.5))
        plt.pie(cats["occurrences"], labels=cats["category"], autopct="%1.0f%%",
                startangle=90)
        plt.title("Sound category mix (synth vs sample)")
        plt.tight_layout(); plt.savefig(os.path.join(OUT, "category_mix.png"), dpi=120)
        plt.close()

    func_df = pd.DataFrame(method_snip.most_common(), columns=["function", "snippets_using"])
    if len(func_df):
        barplot(func_df, "function", "snippets_using",
                "Most-used functions / effects (by # patterns)", "top_functions.png",
                top=30, color="#C44E52")

    # --- console summary ----------------------------------------------------
    print(json.dumps(summary, indent=2))
    print("\nTop 15 sounds:")
    print(sounds_df.head(15).to_string(index=False))
    print(f"\nWrote tables + plots to {os.path.relpath(OUT, ROOT)}/")

if __name__ == "__main__":
    main()
