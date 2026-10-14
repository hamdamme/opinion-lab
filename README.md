# Dietary Supplement Opinion Lab

**Explore evidence. Form your opinion. Compare AI perspectives.**

A living evaluation platform built on a master's research project (*Evaluation of Large
Language Model Tendencies in the Context of Dietary Supplements*, Northeastern
Illinois University, 2025). Read evidence-grounded statements about dietary supplements,
check their scientific sources, rate your own agreement, and see how frontier LLMs rated
the same statements, tracked over time as new models and new statements are added.

## Repository structure

```
├── app/                  React web application (deployed as a static site)
├── data/
│   ├── statements.json   Canonical statement bank (v1.0: 400 statements, immutable IDs)
│   └── runs/             Evaluation runs (immutable; one folder per run)
│       └── run-2025-04/  Run 1: ten LLMs × 400 ratings (the study dataset)
├── analysis/             Scripts that recompute every metric shown in the app or paper
├── docs/
│   ├── PROJECT_BRIEF.md  Approved scope and decisions
│   ├── METHODOLOGY.md    Study design, prompts, metrics, limitations
│   └── VERIFICATION_REPORT.md  Independent audit of the thesis numbers (2026-10-12)
├── README.md
└── ROADMAP.md
```

## Quick start (local)

```bash
cd app
npm install
npm run dev
```

`npm run build` produces the static site in `app/dist/`.

## Reproduce the numbers

```bash
python3 analysis/compute_metrics.py   # requires pandas, numpy
```

Recomputes overall and per-category MAD and Pearson correlation per model from the
canonical data and checks them against the values reported in the paper.

## Data and citation

The statement bank and evaluation runs are released under **CC BY 4.0**. Cite as:

> Aynazarov, H. (2026). Dietary Supplement Opinion Lab Dataset (v1.0). Zenodo.
> [DOI to be assigned; see ROADMAP]

Code is released under the MIT License (see LICENSE).

## Status

v1.0: statement bank of 400 statements, each paired with an evidence source; run 1 (ten LLMs); static
showcase app. See ROADMAP.md for what comes next.

## Disclaimer

This project is for research and education. It does not provide medical or nutritional
advice. Metrics describe agreement patterns between models and reference raters; they are
not measures of factual or medical correctness.
