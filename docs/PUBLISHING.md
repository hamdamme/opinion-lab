# Publishing checklist (owner actions)

These steps require your GitHub and Zenodo accounts. Nothing here publishes anything by
itself — each step is explicit and reversible before release.

## 1. Create the private GitHub repository

From `~/Developer/Projects/opinion-lab`:

```bash
gh repo create opinion-lab --private --source=. --remote=origin
git push -u origin main
```

Verify: `gh repo view --json nameWithOwner,isPrivate,url` shows your account and
`isPrivate: true`.

**Before making it public**, review the tree once (`git ls-files`): it should contain
only this repository's product files. The original research materials (drafts with
credentials, conflicting exports) must stay out — they are not in this repo.

## 2. Make the repository public

Only after the review in step 1:

- On the GitHub repo page: Settings → General → Danger Zone → Change repository
  visibility → Public.
- Or: `gh repo edit --visibility public --accept-visibility-change-consequences`

## 3. Mint a DOI via Zenodo (gives the dataset a citable DOI)

1. Log in at https://zenodo.org with your GitHub account (authorize Zenodo).
2. Zenodo → GitHub → flip the switch on the `opinion-lab` repository.
3. Create a **git tag and GitHub release** for v1.0:

```bash
git tag -a v1.0 -m "v1.0: statement bank (400 statements) + run 1 (10 LLMs)"
git push origin v1.0
```

Then on GitHub: Releases → Draft a new release → choose tag v1.0 → publish.
Zenodo automatically archives the release and assigns a DOI (takes a few minutes).

4. Copy the DOI badge/link into README.md (replace the placeholder) and
   `data/` citation note; commit and push.

## 4. Deploy the app (static hosting)

Recommended: Vercel or Cloudflare Pages, both free for this use.

- Vercel: vercel.com → New Project → import `opinion-lab` → set root directory to `app`
  → deploy. Every push to `main` redeploys automatically.
- Cloudflare Pages: similar; build command `npm run build`, output dir `app/dist`.

The app fetches its dataset from `app/public/data/dataset.json`, which is regenerated
from `data/` when statements or runs change (see app/public/data/README note).

## 5. Optional: ORCID

If you don't have one, register at https://orcid.org — it links your name to the DOI
record permanently and strengthens the public record of the work.
