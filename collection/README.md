# Collection

Preserved collection and analysis notebooks from the 2025 study (Google Colab). These
files document the available historical code; incomplete settings and execution metadata
mean they are not a guarantee of an exactly reproducible model collection. Credential
lookups use Colab Secrets (`userdata.get(...)`); do not add credentials to the repository.

## Files

- `JSON_Maker.ipynb`: built `statements.json` from the raw statement-collection
  spreadsheet (statement text, ODS/NCCIH/PMC source URL, reference rater answer).
- `Evaluation_of_LLMs.ipynb`: the evaluation framework: the shared prompt template
  (section 3.2.0), one query function per model (OpenAI, Anthropic, Gemini, Mistral,
  DeepSeek, Llama, Falcon, EXAONE), the `ask_llm` runner that collected all 4,000
  ratings, and the original analysis and chart code behind the paper's figures.

## Known issue (documented, kept for the record)

The bias-type split in section 6.1.3 used an unanchored `x.y.` regex on statement IDs,
which silently mixed statement groups in one chart. This was caught during independent
verification. Use the canonical prefix-based analysis for subgroup values; the preserved
notebook retains the historical defect and should not be used unchanged to regenerate figures. See
`docs/VERIFICATION_REPORT.md` and the corrected values in `analysis/compute_metrics.py`.

The raw statement-collection spreadsheet is not published; the cleaned, verified output
is `data/statements.json`.
