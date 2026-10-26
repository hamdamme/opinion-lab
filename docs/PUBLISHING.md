# Release and publication guide

## Current publication

- GitHub repository: [hamdamme/opinion-lab](https://github.com/hamdamme/opinion-lab)
- Dataset archive: [Zenodo DOI 10.5281/zenodo.23357963](https://doi.org/10.5281/zenodo.23357963)
- Live application: [opinionlab.hamdam.me](https://opinionlab.hamdam.me)

These links describe the v1.0 publication. Recheck the release, DOI record, and live app
before citing them as the latest versions.

## Prepare a release

1. Confirm the release scope, dataset version, and manuscript changes with the owner.
2. Update the canonical data and documentation. Regenerate the static app dataset with
   `python3 analysis/build_app_dataset.py`.
3. Run the repository checks from the root:

   The strict paper comparison is expected to report a mismatch until the manuscript's
   Gemini overall MAD is corrected from 0.69 to 0.70. `--report-only` is useful for
   reviewing all findings, but it does not turn that discrepancy into a pass.

   ```bash
   python3 analysis/validate_data.py
   python3 analysis/build_app_dataset.py --check
   python3 -m unittest discover -s tests -v
   python3 analysis/compute_metrics.py
   cd app && npm ci && npm run lint && npm run build
   ```

4. Review the full diff, especially changes to canonical data, citations, and generated
   files. Preserve previously released run data; publish a new immutable run directory
   for new model evaluations.
5. After owner approval, tag and publish the release. Verify the GitHub release and the
   corresponding Zenodo archive and DOI.
6. Verify the production deployment and smoke-test the public routes before describing
   the release as live.

## Publication requirements

- Keep code under the MIT license and the statement bank and evaluation runs under CC BY
  4.0, with attribution in the release and archive metadata.
- Cite the exact dataset version used for any reported metric.
- Describe MAD and correlation as agreement measures, not measures of factual or medical
  correctness.
- Distinguish local checks, GitHub Actions, GitHub releases, Zenodo archives, and deployed
  production state when reporting completion.
