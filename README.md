# Dietary Supplement Opinion Lab

**Explore evidence. Form your opinion. Compare AI perspectives.**

**Live app: https://opinionlab.hamdam.me**

A living evaluation platform built on a master's research project (*Evaluation of Large
Language Model Tendencies in the Context of Dietary Supplements*, Northeastern
Illinois University, 2025). Read evidence based statements about dietary supplements,
check their scientific sources, rate your own agreement, and see how frontier LLMs rated
the same statements, tracked over time as new models and new statements are added.

## Repository structure

- `data/`: the dataset (statements, reference ratings, evaluation runs)
- `collection/`: the original collection code that produced the dataset
- `analysis/`: scripts that recompute every published metric
- `app/`: the interactive web app
- `docs/`: methodology, verification report, publishing checklist

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
python3 -m pip install -r requirements.txt
python3 analysis/validate_data.py
python3 -m unittest discover -s tests -v
python3 analysis/compute_metrics.py
```

Recomputes overall and category MAD and Pearson correlation per model from the
canonical data. Dataset validation rejects duplicate IDs, incomplete groups,
missing model ratings, invalid rating values, and changes to archived overall MAD.
The metric baseline preserves the April 2025 study; it does not establish medical correctness.

The paper comparison exits with status 1 when a checked claim differs from the data.
It applies decimal round-half-up to two places and normalizes curly quotes and
whitespace when checking sample text. The archived manuscript still reports
Gemini's overall MAD as 0.69, while the canonical value 0.695 rounds to 0.70 under
that rule. Use `python3 analysis/compute_metrics.py --report-only` to inspect the
comparison without treating paper discrepancies as a failed command. Dataset errors
still fail in this mode. A passing workflow does not certify the manuscript.

GitHub Actions checks that the app dataset is current, validates the research data,
and runs the application lint and production build. Install the application dependencies
with `npm ci` inside `app/` to use its committed lockfile.

## Data and citation

The statement bank and evaluation runs are released under **CC BY 4.0**. Cite as:

> Aynazarov, H. (2026). Dietary Supplement Opinion Lab Dataset (v1.0). Zenodo.
> https://doi.org/10.5281/zenodo.23357963

Code is released under the MIT License (see LICENSE).

## Acknowledgments

Dietary Supplement Opinion Lab builds upon my 2025 master's research project, *Evaluation of Large Language Model Tendencies in the Context of Dietary Supplements*, completed at Northeastern Illinois University under the academic supervision of Dr. Manar Mohaisen.

I sincerely thank Dr. Mohaisen for his academic guidance, mentorship, and support throughout the original research.

The current Opinion Lab platform represents my subsequent independent continuation of that research, extending the original study into a publicly accessible, reproducible research resource.

## Status

v1.0: statement bank of 400 statements, each paired with an evidence source; run 1 (ten LLMs); static
showcase app. See ROADMAP.md for what comes next.

## Disclaimer

This project is for research and education. It does not provide medical or nutritional
advice. Metrics describe agreement patterns between models and reference raters; they are
not measures of factual or medical correctness.

