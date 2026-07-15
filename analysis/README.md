# analysis

Corpus sound-distribution analysis (roadmap Phase 1).

The analysis lives in the notebook
[`../notebooks/01_strudel_corpus_analysis.ipynb`](../notebooks/01_strudel_corpus_analysis.ipynb):
it loads the Strudel pattern corpus from `corpus/github/` (git submodules),
extracts 855+ unique pattern snippets, and produces statistics + plots for every
kind of Strudel element — synths, drums/samples, drum-machine banks,
transformations/functions (categorized), mini-notation features, and pattern
complexity. Markdown cells document the method and the takeaways for generation.

Run it top-to-bottom in Jupyter/Colab. Figures are also saved to `out/` for use
in docs/PRs. The findings drive distribution-weighted generation in `data_gen/`.
See [../docs/roadmap.md](../docs/roadmap.md).
