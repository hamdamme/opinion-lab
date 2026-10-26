# Project Roadmap

Last updated: 2026-10-26

Sources of truth:
- [Project Brief](docs/PROJECT_BRIEF.md)
- [Methodology](docs/METHODOLOGY.md)
- [Verification Report](docs/VERIFICATION_REPORT.md)

| Phase | Scope | Effort estimate | Status |
| --- | --- | --- | --- |
| 0. Research foundation | Thesis verification and corrections; canonical dataset; analysis scripts | done (2026-10-12/13) | Complete |
| 1. Repository foundation | Canonical repo, docs, data versioning, first release v1.0 | 1 session | Complete |
| 2. Showcase app v1 | Clean question → evidence → rating → reveal flow; leaderboard; methodology page; hide study internals by default | 2–4 sessions | Complete |
| 3. Publication | GitHub repo public; Zenodo archive + DOI; deployment (Vercel/Cloudflare Pages) | 1 session + owner actions | Complete (2026-10-14) |
| 4. Run 2 | Add 1–3 current models with a documented prompt version; drift view in the app | 1–2 sessions | Not started |
| 5. Statement bank growth | Owner-reviewed additions with source notes; app updates per data release | ongoing | Not started |

## Current focus

Phases 0–3 are complete as of 2026-10-14. Phase 4 (Run 2) is next when the owner
is ready.

## Blockers

There are no active repository or publication setup blockers. New evaluation runs require
an owner-approved model list, prompt version, and budget before collection begins.

## Release status

v1.0 was released on 2026-10-14. The repository is public, the dataset has a Zenodo DOI
([10.5281/zenodo.23357963](https://doi.org/10.5281/zenodo.23357963)), and the app is live
at [opinionlab.hamdam.me](https://opinionlab.hamdam.me). Verify the release, archive, and
deployment state again before claiming any later release is current.
