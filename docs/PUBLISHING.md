# Release and publication guide

## Current repository and archived release

- [GitHub repository](https://github.com/hamdamme/opinion-lab): current code and documentation.
- [Zenodo v1.0 archive](https://doi.org/10.5281/zenodo.23357963): frozen original release,
  published 2026-10-14, containing the canonical statements and April 2025 ratings.
- [Live application](https://opinionlab.hamdam.me): deployed separately from the frozen archive.

The v1.0 ZIP predates the collection notebooks and repaired analysis pipeline. Its historical
analysis script depends on CSV files not included in that archive. The canonical statement
bank and ratings match the current repository, but reproducible current analysis requires
current repository code. Updating Zenodo metadata does not update the ZIP.

Preserve v1.0 and its DOI. A self-contained archive of later corrections requires a new
approved software release and Zenodo version, not replacement of existing files.
The original data DOI remains usable for the unchanged dataset; record the code commit
used for any reanalysis as well.

## Prepare a release

1. Agree the release scope and version with the owner. Preserve archived statements and
   ratings; new experimental inputs or runs require separate versioning and fresh ratings.
2. Generate the app bundle with `python3 analysis/build_app_dataset.py`.
3. Run the checks from the repository root:

   ```bash
   python3 -m pip install -r requirements.txt
   python3 analysis/validate_data.py
   python3 analysis/build_app_dataset.py --check
   python3 -m unittest discover -s tests -v
   python3 analysis/compute_metrics.py --report-only
   cd app
   npm ci
   npm test
   npm run lint
   npm run build
   ```

   `--report-only` displays selected historical manuscript discrepancies while still failing
   on invalid canonical data. Without it, the script intentionally fails on four historical
   rounding claims: Gemini overall and consumer MAD, GPT-3.5 consumer MAD, and Llama
   professional MAD. These comparison values are recorded in the script; editing a DOCX
   cannot change its result. Do not replace historical claims merely to make the audit pass.
4. Review the diff, references, licensing, and app behavior. Test the release archive from
   an extracted copy so no untracked local file is required for the documented analysis.
5. After owner approval, tag and publish the new release. Verify the Zenodo archive contents,
   metadata, version-specific DOI, and links. Do not move the historical v1.0 tag.
6. Verify production separately after deployment. Local tests, hosted checks, previews,
   production, and immutable archives represent different states.

## Publication requirements

Code remains MIT-licensed; the statement bank and evaluation runs are CC BY 4.0.
State that distinction in a mixed software/data archive's description. Preserve creator
identity and acknowledge supervision of the original research without implying supervision
or endorsement of subsequent independent software releases.

Report agreement metrics as descriptive comparisons, not proof of medical correctness,
clinical safety, or causal framing effects. Cite the data version and analysis-code revision.
See [Zenodo metadata guidance](ZENODO_ACKNOWLEDGMENT_GUIDE.md) for the existing record.
