# Methodology

Condensed from the master's paper (Aynazarov, 2025), with the corrections verified on
2026-10-12 (see VERIFICATION_REPORT.md). This document is the methods reference for the
platform; wording here follows the corrected paper.

## Statement bank

400 Likert-scale statements about dietary supplements, each paired with an evidence source
URL. Statements are derived primarily from NIH Office of Dietary Supplements (ODS) fact
sheets, with a small number of additional statements drawn from NCCIH, PubMed Central, and
other public health sources.

Each statement is labeled on two study dimensions:

- **Audience** — Consumer or Health Professional (200 statements each)
- **Bias direction** — Positive (favoring supplement use) or Negative (expressing
  skepticism) (200 statements each)

The four subgroups contain exactly 100 statements each. Statement IDs encode the design:
`1.1.x` consumer-positive, `1.2.x` consumer-negative, `2.1.x` professional-positive,
`2.2.x` professional-negative. Statement wording is immutable once rated; corrections
create new statement IDs.

## Reference ratings

Each statement carries one reference rating (1–5 Likert) from a human rater: consumer
statements were rated by a knowledgeable consumer; professional statements by a registered
dietitian (RD).

## Model evaluation (run 1, April 2025)

Ten frontier LLMs rated every statement under zero-shot conditions with a shared prompt
template asking for a 1–5 agreement rating: OpenAI GPT-3.5 Turbo, OpenAI o1 Mini,
Anthropic Claude 3.7 Sonnet, Google Gemini 2.0 Flash, Meta LLaMA 3.3 70B, DeepSeek R1,
Mistral Large, Mistral Saba, TII Falcon 3 10B, LG EXAONE Deep 7.8B — 4,000 ratings total.
Decoding parameters follow provider defaults; historical run metadata (exact resolved
versions, timestamps, request settings) was not fully recorded and is labeled unknown.

## Metrics

- **MAD (mean absolute difference)** between model and reference ratings; lower = closer
  numerical agreement.
- **Pearson correlation** between model and reference rating patterns; higher = stronger
  directional alignment.

Both metrics measure agreement with human reference raters. **They are not measures of
factual or medical correctness**, and neither a single integer nor a correlation reveals a
model's reasoning.

## Limitations

- Reference ratings come from two individuals (one consumer, one RD); broader rater panels
  would improve generalizability.
- Statements are fact-sheet-derived and may not represent real-world supplement discourse
  (regional habits, brands, social media).
- Run 1 is a snapshot in time; model behavior changes with updates and new releases.
- A historical subgroup-selection defect in the original analysis notebook (unanchored
  regex) affected bias-split chart values; all published subgroup values were recomputed
  from clean groups of exactly 100 statements each.

## Future runs

Each new evaluation run is stored immutably under `data/runs/<run-id>/` with a manifest
recording date, models, and prompt version. Runs are never edited after release; the
leaderboard always reflects the latest run view while history remains inspectable.
