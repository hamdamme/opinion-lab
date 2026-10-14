# Project Brief, Dietary Supplement Opinion Lab

Status: Approved
Owner: Hamdam Aynazarov
Approval date: 2026-10-13

## Problem

Large language models are increasingly used as informal sources of nutrition and health
information, yet their systematic tendencies (over-agreement, framing sensitivity,
audience-dependent bias) are invisible to end users. A 2025 master's study measured these
tendencies across ten frontier LLMs and 400 source-grounded statements, but the findings sit
in a static document that few will ever read, and the measurements were frozen the day they
were taken.

## Purpose and expected value

Turn the completed study into a living, citable public instrument: anyone can read an
evidence-grounded statement, check its scientific source, form their own judgment, and
compare it against AI positions. Each new evaluation run extends a public record of how
model behavior shifts over time. For the owner, this is an academic-grade showcase of
original, continuing research work (NIW portfolio), with a reproducible repository and a
citable dataset.

## Target users and use cases

- **Evaluators and researchers**: compare model tendencies on a standardized, source-anchored
  statement bank; reuse the dataset with attribution (CC BY 4.0).
- **Curious consumers**: read supplement statements next to their NIH/peer-reviewed sources,
  rate their own agreement, discover where AI stands.
- **Thesis committee and letter writers**: a public, reproducible artifact (repo + DOI) that
  advisor letters can cite concretely.

## Initial scope (v1.0)

- Static web app (React) deployed from this repository: question → evidence → your rating →
  AI comparison ritual; per-model detail one level deep; leaderboard computed from run data;
  methodology page.
- Canonical data package: 400-statement bank (v1.0) + run 1 (10 models × 400 ratings),
  versioned under `data/`.
- Reproducible analysis scripts (`analysis/`) that regenerate every published metric.
- Versioned git releases: v1.0 = thesis dataset and study.

## Out of scope (v1.0)

- Collecting other people's ratings (no backend, no accounts). Static site only.
- Automated source fetching or content reproduction (sources open as external links).
- Medical or nutritional advice of any kind.
- Native mobile apps.

## Constraints and assumptions

- One maintainer (owner); content changes are owner-reviewed before release.
- Hosting: static (Vercel or Cloudflare Pages), free tier; data and app deploy from git.
- Dataset licensing: CC BY 4.0 with attribution; code: MIT.
- Cost per future evaluation run: modest LLM API spend; owner-controlled.
- Honest framing everywhere: metrics describe agreement patterns, never factual correctness.

## Success criteria

- `npm run build` passes; deployed site loads with all 400 statements and run-1 ratings.
- Every number shown in the app is reproducible by running `analysis/compute_metrics.py`.
- Repository has a tagged v1.0 release; dataset archived on Zenodo with a DOI.
- A first-time visitor can complete the full ritual (statement → source → rating → reveal)
  in under two minutes without instructions.

## Open questions and risks

- Zenodo DOI minting requires linking the owner's GitHub account to Zenodo (owner action).
- Future runs need consistent prompting; a prompt version file must be kept per run.
- Statement wording is immutable once rated; corrections create new statement IDs.
