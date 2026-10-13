# Data

Canonical statement bank and evaluation runs for Opinion Lab.

- `statements.json` — the statement bank (v1.0). 400 statements; IDs are immutable
  (`1.1.x` consumer-positive, `1.2.x` consumer-negative, `2.1.x` professional-positive,
  `2.2.x` professional-negative). Fields: `id`, `statement`, `reference_url`,
  `user_answer` (reference rating 1–5).
- `runs/` — one folder per evaluation run; each contains `results.json`
  (model → statement ID → rating 1–5) and `run.json` (manifest: date, models, prompt
  metadata, verification notes). Runs are immutable once published.

Derived file for the web app: `../app/public/data/dataset.json`, built from the files in
this directory. Regenerate it whenever the statement bank or runs change.

License: CC BY 4.0 — attribute as "Aynazarov, H. (2026). Dietary Supplement Opinion Lab
Dataset." See the repository LICENSE for the full dual-license note.
