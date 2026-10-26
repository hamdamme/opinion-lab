# Opinion Lab web application

A static React and TypeScript application for exploring the archived April 2025 dietary
supplement statements and model ratings. It uses Vite and Tailwind CSS. Node.js 22 is used
in CI; install the exact dependency versions with the committed npm lockfile.

## Development and checks

From this directory:

```bash
npm ci
npm test
npm run lint
npm run build
npm run dev
```

The development server uses port 3000. `npm run build` writes `dist/`;
`npm run preview` serves the production build locally. Host the app at the origin root
so `/data/dataset.json` resolves correctly.

## Data and calculations

`public/data/dataset.json` is generated from the canonical statement bank, archived model
ratings, and display metadata. From the repository root:

```bash
python3 analysis/build_app_dataset.py
python3 analysis/build_app_dataset.py --check
```

Do not edit the generated bundle manually. `src/lib/stats.ts` computes exact agreement,
agreement within one point, MAD, and signed mean differences. Insights displays study MAD
to four decimal places, preserving the exact means of the 400 integer differences.
`analysis/compute_metrics.py` separately reports study MAD/Pearson metrics and selected
historical manuscript discrepancies; it does not validate a revised Word manuscript.

## Application structure

- `src/sections/Ritual.tsx`: evidence links, statement ratings, and five-statement rounds.
- `src/sections/Insights.tsx`: comparisons with reference ratings and the user's ratings.
- `src/sections/About.tsx`: study design, attribution, and interpretation.
- `src/hooks/useDataset.ts`: dataset loading and validated local answer storage.
- `src/lib/browserState.ts`: optional browser-storage access and input validation.
- `src/components/LiveCompareDialog.tsx`: optional exploratory API request.
- `src/components/FeedbackDialog.tsx`: optional Formspree feedback submission.

## Privacy and optional services

Statement ratings are kept in browser localStorage. When storage is blocked, ratings work
in memory but do not persist after reload. Invalid stored answers are ignored. Earlier
versions' persisted live API settings are removed on load where storage is accessible.

Feedback submission sends the entered message, optional source-trust response, and optional
email to Formspree. It does not attach the saved statement ratings.

Live comparison sends the selected statement, source URL, and API credential directly to
the HTTPS endpoint chosen by the user. The key is held only in memory while the dialog is
open. Closing it or selecting a different statement clears its state and aborts the local
request; aborting does not guarantee cancellation of provider processing or charges.
The endpoint must support browser requests. The live prompt and settings differ from the
archived experiment, and live results are exploratory rather than a new archived run.
No feedback or paid API requests are needed to run the automated tests.

See the root [README](../README.md), [methodology](../docs/METHODOLOGY.md), and
[license](../LICENSE) for research context and licensing.
