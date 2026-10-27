# Dietary Supplement Opinion Lab

**Explore evidence. Form your opinion. Compare AI perspectives.**

**Live app: https://opinionlab.hamdam.me**

A research exploration platform built on a master's research project (*Evaluation of Large
Language Model Tendencies in the Context of Dietary Supplements*, Northeastern
Illinois University, 2025). Explore source-linked statements about dietary supplements,
check their evidence sources,
rate your own agreement, and compare it with archived ratings from ten language models.
The current public dataset contains one evaluation run from April 2025; additional runs
and statement versions are planned. A source link does not imply that a statement is true.

For a concise study summary, see the [academic research overview](docs/ACADEMIC_RESEARCH_OVERVIEW.md).
The [methodology](docs/METHODOLOGY.md) explains the design and its limitations.

## Repository structure

- `data/`: the dataset (statements, reference ratings, evaluation runs)
- `collection/`: the original collection code that produced the dataset
- `analysis/`: data validation, study metrics, and app dataset generation
- `app/`: the interactive web app
- `docs/`: methodology, verification report, publishing checklist

```
├── app/                  React web application (deployed as a static site)
├── data/
│   ├── statements.json   Canonical statement bank (v1.0: 400 statements, immutable IDs)
│   └── runs/             Evaluation runs (immutable; one folder per run)
│       └── run-2025-04/  Run 1: ten LLMs × 400 ratings (the study dataset)
├── analysis/             Scripts for validation and archived study metrics
├── docs/
│   ├── PROJECT_BRIEF.md  Approved scope and decisions
│   ├── METHODOLOGY.md    Study design, prompts, metrics, limitations
│   └── VERIFICATION_REPORT.md  Research verification and corrections (rechecked 2026-10-26)
├── README.md
└── ROADMAP.md
```

## Quick start (local)

```bash
cd app
npm ci
npm run dev
```

`npm run build` produces the static site in `app/dist/`.

## Reproduce the numbers

```bash
python3 -m pip install -r requirements.txt
python3 analysis/validate_data.py
python3 -m unittest discover -s tests -v
python3 analysis/compute_metrics.py --report-only
```

Recomputes overall and category MAD and Pearson correlation per model from the
canonical data. Dataset validation rejects duplicate IDs, incomplete groups,
missing model ratings, invalid rating values, and changes to archived overall MAD.
The metric baseline preserves the April 2025 study; it does not establish medical correctness.

The paper comparison exits with status 1 when a checked claim differs from the data.
It applies decimal round-half-up to two places and normalizes curly quotes and
whitespace when checking sample text. The historical manuscript comparison includes known
rounding discrepancies, including
Gemini overall MAD (0.6950 → 0.70) and consumer MAD (0.7050 → 0.71),
GPT-3.5 consumer MAD (0.8550 → 0.86), and Llama professional MAD (0.9650 → 0.97).
The script checks selected historical claims, not the entire manuscript or a later revision.
Use `python3 analysis/compute_metrics.py --report-only` to inspect the
comparison without treating paper discrepancies as a failed command. Dataset errors
still fail in this mode. A passing workflow does not certify the manuscript.

GitHub Actions checks that the app dataset is current, validates the research data,
and runs the application lint and production build. Install the application dependencies
with `npm ci` inside `app/` to use its committed lockfile. Run `npm test` there for
application regression checks.

## Data and citation

The statement bank and evaluation runs are released under **CC BY 4.0**. Cite as:

> Aynazarov, H. (2026). Dietary Supplement Opinion Lab Dataset (v1.0). Zenodo.
> https://doi.org/10.5281/zenodo.23357963

The DOI preserves the original v1.0 repository snapshot, including the dataset. It does
not contain later collection notebooks or the repaired analysis pipeline. Use the current
repository for those additions; see [release and archive scope](docs/PUBLISHING.md).

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

