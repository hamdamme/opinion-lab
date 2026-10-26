# Research verification report

Rechecked on 2026-10-26 against `data/statements.json` and
`data/runs/run-2025-04/results.json`. This report supersedes incorrect conclusions in the
earlier report; it does not change the archived ratings or assert that every manuscript
claim has been validated. It distinguishes the historical manuscript comparison from
canonical-data checks and later manuscript editing.

## Scope and reproducibility

The canonical archive contains 400 unique statements, four groups of exactly 100,
400 reference ratings, and 4,000 complete integer model ratings from 1 to 5.
The app bundle is derived from these records and separate display metadata.

```bash
python3 -m pip install -r requirements.txt
python3 analysis/validate_data.py
python3 analysis/build_app_dataset.py --check
python3 -m unittest discover -s tests -v
python3 analysis/compute_metrics.py --report-only
```

The metrics script recomputes overall, audience, and all four framing-group MAD values
and overall/audience Pearson correlations. It also compares selected historical paper
claims and twelve sample fragments. It does not read a DOCX, certify the full manuscript,
or check every app statistic. The app's additional agreement statistics are implemented
in `app/src/lib/stats.ts`. Passing CI means the configured repository checks passed.

## Recomputed results

MAD is mean absolute difference from the single reference rating per statement; Pearson r
is linear association. Neither is a measure of medical correctness or reasoning.

| Archived model name | MAD all | MAD consumer | MAD professional | r all | r consumer | r professional |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| OpenAI 3.5 Turbo | 0.8200 | 0.8550 | 0.7850 | 0.2755 | 0.3865 | 0.1172 |
| Anthropic Claude 3.7 | 0.7300 | 0.8100 | 0.6500 | 0.4511 | 0.4458 | 0.4116 |
| Meta Llama 3.3 70B | 1.0800 | 1.1950 | 0.9650 | 0.4185 | 0.5054 | 0.2428 |
| OpenAI o1 Mini | 0.8225 | 0.9050 | 0.7400 | 0.4289 | 0.4674 | 0.3078 |
| Google Gemini 2.0 Flash | 0.6950 | 0.7050 | 0.6850 | 0.4462 | 0.5075 | 0.3330 |
| Mistral Large | 0.6775 | 0.6750 | 0.6800 | 0.4427 | 0.5209 | 0.2855 |
| Mistral Saba | 0.7100 | 0.7000 | 0.7200 | 0.4078 | 0.4899 | 0.2529 |
| Deepseek R1 | 0.6900 | 0.7500 | 0.6300 | 0.4790 | 0.5087 | 0.3976 |
| Falcon3 10B | 0.7200 | 0.6850 | 0.7550 | 0.4232 | 0.5509 | 0.2223 |
| LG ExaOne Deep 7B | 0.9125 | 1.0300 | 0.7950 | 0.4317 | 0.4375 | 0.3761 |

### Framing groups

Each column below contains 100 statements. These groups contain different claims and are
not matched counterfactual versions of the same statements.

| Archived model name | Consumer positive | Consumer negative | Professional positive | Professional negative |
| --- | ---: | ---: | ---: | ---: |
| OpenAI 3.5 Turbo | 0.93 | 0.78 | 0.82 | 0.75 |
| Anthropic Claude 3.7 | 0.73 | 0.89 | 0.72 | 0.58 |
| Meta Llama 3.3 70B | 1.11 | 1.28 | 0.96 | 0.97 |
| OpenAI o1 Mini | 0.88 | 0.93 | 0.83 | 0.65 |
| Google Gemini 2.0 Flash | 0.64 | 0.77 | 0.69 | 0.68 |
| Mistral Large | 0.60 | 0.75 | 0.72 | 0.64 |
| Mistral Saba | 0.67 | 0.73 | 0.76 | 0.68 |
| Deepseek R1 | 0.73 | 0.77 | 0.68 | 0.58 |
| Falcon3 10B | 0.64 | 0.73 | 0.74 | 0.77 |
| LG ExaOne Deep 7B | 1.05 | 1.01 | 0.74 | 0.85 |

## Corrections to earlier reporting

1. **Consumer framing:** negative-group MAD exceeds positive-group MAD for **8 of 10**
   models, not all ten. GPT-3.5 Turbo and EXAONE are the exceptions. For professional
   statements, negative-group MAD is higher for **3 of 10** models: Llama, Falcon, and
   EXAONE. These descriptive comparisons do not establish causal framing bias.
2. **Audience:** professional MAD is lower for **7 of 10** models; Mistral Large,
   Mistral Saba, and Falcon are the exceptions. Consumer correlation is higher for all ten.
   Different reference raters and statement sets prevent isolating an audience effect.
3. **Rounding:** decimal round-half-up gives Gemini overall 0.6950 → **0.70**, Gemini
   consumer 0.7050 → **0.71**, GPT-3.5 consumer 0.8550 → **0.86**, and Llama professional
   0.9650 → **0.97**. The earlier report incorrectly marked some of these as matching.
   Gemini overall 0.6950 and DeepSeek overall 0.6900 are not identical values.
4. **Historical notebook groups:** unanchored regexes such as `1.2.` admit unrelated
   IDs. The historical selections contain 110 consumer-negative and 111 professional-positive
   records. Prefix-based selection produces exactly 100 each. Llama consumer MAD is
   **1.11 positive and 1.28 negative**, not the historical 1.02/1.32 claim. Do not infer
   that every other figure or interpretation is correct from this single repair.
5. **Reference allocation:** the author confirmed that the consumer rated only the 200
   consumer statements and the dietitian only the 200 professional statements. There are
   no overlapping ratings for an inter-rater reliability estimate.
6. **Sources:** 390 statement URLs point to NIH ODS; the other ten are five PMC, three
   NCCIH, one OPSS, and one American Cancer Society. Source association is not truth validation.
7. **Collection conditions:** a shared user prompt did not make all system messages,
   parsing, generation settings, or inference environments identical. The historical
   manifest's provider-default description is incomplete; see [Methodology](METHODOLOGY.md).
8. **Interpretation:** lower MAD and higher correlation occupy the upper-left direction
   on a MAD-versus-correlation plot. Neither metric identifies a clinically safe model.
   Claude has the smallest audience correlation gap in this archive; calling it the
   “only balanced model” would require a defined criterion and additional evidence.

## Historical manuscript comparison

Running `python3 analysis/compute_metrics.py` without `--report-only` returns a nonzero
status for known historical manuscript discrepancies. With `--report-only`, those findings
are displayed without failing the command; invalid canonical data still fails. This is an
explicit audit mode, not a claim that known discrepancies have disappeared. A later revised
manuscript is a separate artifact and is not automatically validated by these checks.

Earlier manuscript review also identified duplicate or malformed references and unsupported
parameter-count claims. A bibliography and model-version review must be performed on the
specific manuscript being submitted. API aliases do not reliably establish exact historical
model versions or parameter counts.

## Preservation and limits

Canonical statement wording, source URLs, reference ratings, and model ratings remain
unchanged. Experimental wording changes require new inputs and fresh ratings. Historical
notebooks remain available with their known defects documented; use the prefix-based
analysis for current statistics. The original spreadsheet and alternate exports are not
part of the public canonical data package and are not validated by repository CI.

Recomputation verifies the archived calculations. It does not establish independent
replication, peer review, current model performance, or clinical validity.
