# Paper Verification Report
## MASTER_PAPER.docx, *Evaluation of Large Language Model Tendencies in the context of Dietary Supplements*

**Original audit date:** 2026-10-12; **repository recheck:** 2026-10-26
**Method:** The original audit recomputed manuscript claims from the raw collection and reviewed the analysis notebook. The repository recheck uses the versioned canonical files in `data/`, the comparison script in `analysis/compute_metrics.py`, and the generated app bundle.

## Repository recheck (2026-10-26)

- The canonical data contains 400 statements and 4,000 model ratings; the generated app bundle now takes statement wording, source URLs, reference ratings, and model ratings directly from those canonical files.
- App display topics and model descriptions are versioned separately in `data/app_metadata.json`.
- Sample text checks normalize curly quotes and whitespace, so typographic apostrophes do not create false mismatches. Statement wording remains case-folded and checked as a substring.
- Overall MAD values are unchanged. The manuscript's Gemini value of 0.69 remains inconsistent with the canonical value 0.695, which rounds to 0.70 under the script's explicit decimal round-half-up rule.
- The repository validation workflow checks that the generated app bundle is current. A passing workflow verifies repository consistency, not the manuscript as a whole.

---

## Executive summary

**The stored ratings and raw metrics are reproducible.** The original audit found the overall and category MAD values, Pearson correlations, correlation rankings, and sample rows consistent when computed with correct statement groups. Gemini's published overall rounding remains a discrepancy: 0.695 is reported as 0.69 in the manuscript, while this repository uses decimal round-half-up and reports 0.70.

**Seven issues were identified in the original manuscript audit.** The repository records them here so they can be resolved against the source document before the manuscript is reused.

---

## ✅ Verified claims (recomputed, match)

| Claim in paper | Recomputed result | Status |
|---|---|---|
| Overall MAD: Mistral Large 0.68, Deepseek 0.69, Falcon3 0.72, Claude 0.73, ExaOne 0.91, GPT-3.5 0.82, o1 Mini 0.82, LLaMA 1.08 | 0.6775 / 0.6900 / 0.7200 / 0.7300 / 0.9125 / 0.8200 / 0.8225 / 1.0800 | ✅ |
| Gemini overall MAD "0.69" | 0.6950 | ⚠️ Reports 0.69; decimal round-half-up gives 0.70 |
| Consumer MAD: Mistral 0.68, Falcon 0.69, Gemini 0.70, Saba 0.70, R1 0.75, Claude 0.81, GPT-3.5 0.85, LLaMA 1.20, ExaOne 1.03 | 0.675 / 0.685 / 0.705 / 0.700 / 0.750 / 0.810 / 0.855 / 1.195 / 1.030 | ✅ |
| Professional MAD: R1 0.63, Claude 0.65, Mistral 0.68, Gemini 0.69, Saba 0.72, o1 0.74, Falcon 0.76, GPT-3.5 0.79, ExaOne 0.80, LLaMA 0.96 | 0.630 / 0.650 / 0.680 / 0.685 / 0.720 / 0.740 / 0.755 / 0.785 / 0.795 / 0.965 | ✅ |
| Overall correlation range 0.28–0.48; R1 highest (0.48); GPT-3.5 lowest (0.28) | 0.2755 to 0.4790 | ✅ |
| Consumer correlations: Falcon 0.55, Mistral 0.52, R1/Gemini/LLaMA 0.51, Saba 0.49, Claude 0.45, GPT-3.5 0.39 | 0.551 / 0.521 / 0.509 / 0.508 / 0.505 / 0.490 / 0.446 / 0.387 | ✅ |
| Professional correlations: Claude 0.41, R1 0.40, ExaOne 0.38, Gemini 0.33, o1 0.31, Mistral 0.29, GPT-3.5 0.12 | 0.412 / 0.398 / 0.376 / 0.333 / 0.308 / 0.286 / 0.117 | ✅ |
| "For every model, consumer correlation > professional correlation" (Fig. 9 claim) | Holds for all 10 models | ✅ |
| Claude "only balanced model" (consumer 0.45 / professional 0.41) | 0.446 / 0.412, smallest gap among all models | ✅ |
| 4,000 total responses (10 × 400) | 4,000 ratings present, all in 1–5, none missing | ✅ |
| Four balanced subgroups of 100 | Exactly 100 each (1.1.x, 1.2.x, 2.1.x, 2.2.x) | ✅ |
| Table 1 sample rows (12 statements incl. IDs 1.1.6, 1.1.7, 1.1.43, 1.2.15, 1.2.17, 1.2.100, 2.1.4, 2.1.69, 2.1.77, 2.2.5, 2.2.40, 2.2.41) | All texts and reference answers match the dataset | ✅ |
| "Negatively biased statements yielded higher MAD" for consumer statements | Holds for all 10 models on consumer group | ✅ (with nuance, see issue 5) |

---

## Issues requiring action

### Issue 1, Figure 4 bias-split numbers came from a buggy notebook selection ❗

Notebook cell 48 (function `compute_llm_abs_diffs_with_bias`) selects subgroups with unanchored regexes:

```python
consumer_negative = consumer[consumer.index.str.contains("1.2.")]
professional_positive = professional[professional.index.str.contains("2.1.")]
```

The `.` characters match any character, so these select **110** consumer-negative and **111** professional-positive records instead of 100 each (10 records from group 1.1.x leak into "consumer-negative"; 11 from 2.2.x leak into "professional-positive").

**Trace to the paper:** the manuscript's Figure 4 claim, *"Meta LLaMA 3.3 70B had the largest gap between positive and negative responses, particularly for consumer prompts **1.32 vs. 1.02**"*, contains **1.32**, which is exactly the buggy selection's value (1.3182). The correct values from clean groups are:

- LLaMA consumer positive: **1.11** (not 1.02, no computed combination produces 1.02; this number appears to be an error)
- LLaMA consumer negative: **1.28** (not 1.32)

**Fix:** recompute Figure 4 from clean groups and update the sentence to "1.28 vs. 1.11". The qualitative conclusion (LLaMA shows the largest positive/negative gap, and negatively-framed consumer statements are harder for most models) still holds with correct numbers.

Note: Figures 1–3 and 5–10 values in the text are all consistent with *correct* groups, so only Figure 4 and its discussion sentence are affected.

### Issue 2, "Derived from ODS fact sheets" is inaccurate for 10 statements

Methodology 3.1 states *"all statements were derived from publicly available ODS fact sheets."* In the dataset, **390 of 400** source URLs are ODS; the other 10 are: 5 PubMed Central, 3 NCCIH, 1 OPSS (opss.org), 1 American Cancer Society.

**Fix:** change to "primarily derived from NIH Office of Dietary Supplements fact sheets, with additional sources from NCCIH, PubMed Central, and related public health bodies." (The reference list at the end of the paper already cites some of these, so the fix is internally consistent.)

### Issue 3, Rounding inconsistency (minor)

Gemini overall MAD is 0.6950. The paper reports 0.69 in section 4.1.1 but the identical-value Deepseek R1 (0.6900) is also "0.69", while in section 4.1.2 Gemini's consumer MAD of 0.7050 is reported as "0.70". Standard rounding of 0.6950 gives 0.70. Either report three decimals throughout, or define a rounding rule and apply it uniformly (the audit's baseline table keeps 0.6950 internally, that is the safest choice for a petition document).

### Issue 4, The two-rater claim is not fully supported by stored data

The abstract says *"Benchmark responses from a consumer and a registered dietitian were used for comparison"* and section 3.5 says each LLM output was compared to *"a single reference response per statement"* from two sources. The stored dataset contains exactly **one** reference rating per statement (consumer-group statements carry one answer, professional-group statements carry one). If each rater rated only the 200 statements in their domain, say so explicitly, that is a clean, defensible design. If both actually rated all 400 and the second rater's answers exist somewhere, locate and archive them; if they cannot be produced, avoid any phrasing that implies 800 stored reference ratings.

### Issue 5, One nuance in the bias-direction summary (4.1.4)

The claim *"negatively biased statements yielded higher mean absolute differences compared to positive ones"* holds for **all models on consumer statements**. On professional statements the pattern reverses for several models (Mistral Large 0.72 pos vs 0.64 neg; Mistral Saba 0.76 vs 0.68; Deepseek R1 0.68 vs 0.58). Recommend qualifying the sentence: *"…particularly for consumer-framed prompts; among professional statements the pattern was less uniform."* This actually strengthens the paper, it shows audience-dependent bias behavior.

### Issue 6, Reference list needs cleanup (important for a petition document)

- **Duplicates:** the Azimi et al. dietitian-exam paper appears twice; Cheng Peng et al. appears twice; Roberts et al. appears twice.
- **Malformed URL:** one reference has `informatics.omj.com`, a typo of `informatics.bmj.com`.
- **Raw BibTeX pasted as text:** the Barocas, Hardt & Narayanan entry is not formatted as a reference.
- **Unverifiable generic entry:** "Smith, J., Johnson, L. and Lee, K. (2022) A Comprehensive Review of Cross-Validation Techniques…" looks like a placeholder citation; verify it exists or replace it.
- Minor: reference 1 has "(Al)" with a lowercase L instead of "AI".

### Issue 7, Table 2 parameter accuracy

DeepSeek R1 is listed as "37B parameters"; the model is a 671B-total / 37B-active Mixture-of-Experts. Recommend "671B total / 37B active (MoE)". LLaMA 3.3 70B and Mistral Large (123B) are correct per public information.

---

## Dataset file dispositions (for your decision)

| File | Verdict |
|---|---|
| `Project_Results_LLM/statements.json` + `results.json` | ✅ Canonical raw collection, what was sent to models and what came back |
| `final_full_results.csv` | ✅ Ratings and reference answers match the raw collection; two statement texts differ (2.1.17 punctuation and 2.1.53 adds "sexual"). The **JSON wording is what the models saw**; keep it as the citable wording. |
| `all_featured_results.csv` | ⚠️ Different dataset version, 42 reference answers and 368 model ratings differ from the canonical set. Do not cite or merge; archive separately until its provenance is explained |
| `draft200 Statements.xlsx` | ⚠️ Contains credential-shaped strings (per audit), **rotate those API keys**, never distribute |
| `Evaluation_of_LLMs.ipynb` | ⚠️ Cell 48 subgroup bug (Issue 1); do not re-run for publication figures without fixing the regexes (`str.startswith("1.2.")` / anchor the patterns) |

---

## Reproduction notes

All recomputed values derive from ID-keyed joins between `data/statements.json` (400 statements, reference answers, source URLs) and `data/runs/run-2025-04/results.json` (10 models × 400 integer ratings). The reproducible comparison is `analysis/compute_metrics.py`. Groups are defined by ID prefix (`1.1.x` = consumer-positive, `1.2.x` = consumer-negative, `2.1.x` = professional-positive, `2.2.x` = professional-negative), each exactly 100 statements. Pearson uses NumPy `corrcoef`; MAD is mean absolute difference against the single stored reference answer per statement.
