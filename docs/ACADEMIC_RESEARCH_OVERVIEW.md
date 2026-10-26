# Academic Research Overview

## Dietary Supplement Opinion Lab

- **Original master's research:** *Evaluation of Large Language Model Tendencies in the Context of Dietary Supplements*
- **Institution:** Northeastern Illinois University, Department of Computer Science
- **Year:** 2025
- **Primary academic supervisor:** Dr. Manar Mohaisen

## Research problem and objective

The original study examined how large language models respond to evidence-grounded statements about dietary supplements. It focused on patterns in model agreement across different audiences and framing directions. The objective was to compare model ratings with a human reference rating for each statement and to examine how agreement varied across the study groups.

## Dataset and evaluation

The study used 400 statements organized across two dimensions: audience (consumer or health professional) and framing (positive or negative). Each of the four groups contained 100 statements. Ten large language models rated all 400 statements, producing 4,000 model ratings. Each statement has one stored reference rating; the knowledgeable consumer rated only the 200 consumer statements, and the registered dietitian rated only the 200 health-professional statements. Because their statement sets do not overlap, audience and rater effects cannot be separated and inter-rater reliability cannot be estimated.

The analysis reports mean absolute difference (MAD), which measures the average numerical distance between model and reference ratings, and Pearson correlation, which measures the linear association between their rating patterns. These are agreement measures. They do not independently establish whether a statement, model response, or reference rating is medically correct.

## Reproducibility and continuation

The public repository preserves the statement bank, evaluation-run ratings, run metadata, data validation, and scripts for recomputing the reported metrics. The repository also includes a verification report documenting historical analysis issues and limitations. The archived run is a snapshot: exact resolved model versions and some request-level metadata were not fully recorded at collection time.

After completing the master's research, I independently continued the work by developing the Opinion Lab platform and its public, reproducible dataset. The platform makes the statements, evidence sources, and historical model ratings accessible for exploration. This subsequent software development is independent work; Dr. Mohaisen's acknowledgment here refers to his supervision of the original 2025 master's research.

## Public resources

- [Live Opinion Lab platform](https://opinionlab.hamdam.me)
- [Source code and research materials](https://github.com/hamdamme/opinion-lab)
- [Dataset record on Zenodo](https://doi.org/10.5281/zenodo.23357963)
