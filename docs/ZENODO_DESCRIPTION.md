## Opinion Lab v1.0

First public snapshot of the master's research dataset and accompanying software.

This dataset originates from master's research conducted at Northeastern Illinois University
in 2025 under the academic supervision of Dr. Manar Mohaisen. The research was subsequently
extended independently into the Dietary Supplement Opinion Lab platform.

- 400 dietary supplement statements across consumer/health-professional audiences and
  positive/negative framing, with 100 statements per group and a source URL for each statement
  (primarily NIH Office of Dietary Supplements fact sheets).
- One reference rating per statement: a knowledgeable consumer rated the 200 consumer
  statements, and a registered dietitian rated the 200 health-professional statements.
- 4,000 archived ratings from 10 language models evaluated in April 2025, using a shared
  zero-shot user prompt. Model-specific generation conditions differed.
- An interactive web app and historical analysis code. Collection notebooks and the repaired
  reproducible analysis pipeline are available in the current GitHub repository and are not
  included in this frozen v1.0 archive. The archived analysis script requires files absent
  from the ZIP; use the current repository for reproducible reanalysis.

Current source code and documentation: https://github.com/hamdamme/opinion-lab

Live platform: https://opinionlab.hamdam.me

Code is licensed under MIT. The statement bank and evaluation ratings are licensed under
CC BY 4.0. The original dataset and ratings are preserved; later code corrections are
maintained separately from this archived release.

Research and education only. Agreement metrics do not establish medical correctness.
This project does not provide medical or nutritional advice.
