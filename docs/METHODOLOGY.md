# Methodology

This reference describes the April 2025 archived study and the subsequent Opinion Lab
platform. It was rechecked against the canonical ratings and preserved collection notebook
on 2026-10-26. See [Verification Report](VERIFICATION_REPORT.md) for numerical corrections.

## Statement bank

The dataset contains 400 source-linked dietary supplement statements, balanced across
consumer and health-professional audiences and positive and negative framing. Each of the
four groups has 100 statements. IDs encode the groups: `1.1.x` consumer-positive,
`1.2.x` consumer-negative, `2.1.x` professional-positive, and `2.2.x` professional-negative.

Of the 400 per-statement source URLs, 390 point to NIH Office of Dietary Supplements,
five to PubMed Central, three to NCCIH, one to OPSS, and one to the American Cancer Society.
These are URL counts across statements, not counts of distinct publications. A linked
source does not establish that its associated statement is correct.

Framing labels describe the intended statement construction. They have not been independently
validated. Positive and negative groups contain different claims, not matched rewrites of
the same claims. Statement wording is preserved once rated; wording changes require a new
version or ID and fresh ratings rather than reusing historical responses.

## Reference ratings

The knowledgeable consumer rated only the 200 consumer statements. The registered dietitian
rated only the 200 professional statements. This allocation was confirmed by the study
author on 2026-10-26; the archive contains one reference rating per statement, 400 in total.
The raters did not rate overlapping statement sets, so inter-rater reliability cannot be
estimated. Audience comparisons also combine differences in statements and rater identity.
Neither reference set represents a consensus panel or an independently adjudicated gold standard.

## Model evaluation

Ten models each have 400 stored ratings: GPT-3.5 Turbo, o1-mini, Claude 3.7 Sonnet,
Gemini 2.0 Flash, Llama 3.3 70B, DeepSeek R1, Mistral Large, Mistral Saba,
Falcon 3 10B, and EXAONE Deep 7.8B. Results concern the historical run, not current rankings.

The shared user prompt asks for a single integer from 1 (strongly disagree) to 5
(strongly agree). It contains output-number examples but no worked statement-answer
demonstrations: this is zero-shot rating with output-format examples. The preserved prompt
and model-specific functions are in `collection/Evaluation_of_LLMs.ipynb`.

Inference conditions were not identical. API and local wrappers differ in system messages,
token limits, parsing, and generation settings. EXAONE explicitly uses temperature 0.6 and
top-p 0.95. The older run manifest's broad statement that decoding followed provider defaults
is incomplete; the notebook and this clarification should be consulted together. The historical
manifest is retained unchanged. Exact resolved model versions, request timestamps, and all
decoding settings cannot be reconstructed from the available records.

One stored result per model-statement pair does not imply exactly one attempted request:
the collection loop retries failures and skips already stored results. There are no repeated
runs for estimating response variability.

## Metrics and interpretation

- **Mean absolute difference (MAD):** mean absolute distance between model and reference
  ratings. Lower values indicate closer numerical ratings.
- **Pearson correlation:** linear association between model and reference ratings.
  Higher correlation does not necessarily imply lower MAD or exact agreement.

These descriptive measures treat the ordinal response categories as equally spaced numbers.
They do not establish medical correctness, reasoning quality, clinical safety, or causal bias.
The analysis reports no inferential test of model superiority. The app additionally computes
exact agreement, agreement within one point, and signed differences in `app/src/lib/stats.ts`.

MAD display values in the study comparison use decimal round-half-up to two places;
retain four decimal places when comparing close results. The selected historical manuscript
checks in `analysis/compute_metrics.py` are distinct from validating the canonical data.

## Limitations and future runs

The curated English statements, two non-overlapping raters, unvalidated framing labels,
single stored responses, and incomplete collection metadata limit generalization.
Differences across framing groups cannot isolate framing from claim content or difficulty.
MAD removes the sign of rating differences and cannot establish a tendency to endorse claims.

Archived statistics can be recomputed; regenerating identical historical model responses is
not guaranteed. Future runs should record immutable model identifiers where available,
complete prompts and settings, timestamps, and repeated responses. New runs belong in new
versioned directories under `data/runs/`; the current public dataset contains only run 1.
