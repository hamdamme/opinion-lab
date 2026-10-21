"""Recompute every numeric claim in MASTER_PAPER.docx from the raw collection
(statements.json + results.json) and, when available, from the CSV export.

Usage (from the repository root):
    python analysis/compute_metrics.py

The canonical inputs are versioned in this repository:
  data/statements.json                  400 statements + reference ratings
  data/runs/run-2025-04/results.json    model -> {statement id: rating}
An optional cross-check against data/../app-data/final_full_results.csv runs
only if that file is present.
"""
import argparse
import json
from validate_data import load_and_validate
import re
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
RUN = DATA / "runs" / "run-2025-04"

parser = argparse.ArgumentParser(description="Recompute study metrics and report paper discrepancies.")
parser.add_argument("--report-only", action="store_true", help="Report known paper discrepancies without failing; dataset validation still fails on errors.")
args = parser.parse_args()
load_and_validate()
failures = []

# ---------- load ----------
stmts = {s["id"]: s for s in json.load(open(DATA / "statements.json"))}
results = json.load(open(RUN / "results.json"))  # model -> {id: "rating"}
models = list(results.keys())

final_csv = ROOT / "app-data" / "final_full_results.csv"
final = pd.read_csv(final_csv) if final_csv.exists() else None
if final is None:
    print(f"note: {final_csv.relative_to(ROOT)} not found, CSV cross-check skipped")

ratings = {m: {i: int(v) for i, v in results[m].items()} for m in models}
ref = {i: int(s["user_answer"]) for i, s in stmts.items()}

def group(id_):
    a, b, _ = id_.split(".")
    aud = "Consumer" if a == "1" else "Professional"
    bias = "Positive" if b == "1" else "Negative"
    return aud, bias

def mad(model, ids):
    return np.mean([abs(ratings[model][i] - ref[i]) for i in ids])

def pearson(model, ids):
    x = np.array([ratings[model][i] for i in ids], float)
    y = np.array([ref[i] for i in ids], float)
    if x.std() == 0 or y.std() == 0:
        return float("nan")
    return float(np.corrcoef(x, y)[0, 1])

all_ids = sorted(stmts.keys())
cons_ids = [i for i in all_ids if group(i)[0] == "Consumer"]
prof_ids = [i for i in all_ids if group(i)[0] == "Professional"]
print(f"groups: all={len(all_ids)} consumer={len(cons_ids)} prof={len(prof_ids)}")
for g in ["1.1", "1.2", "2.1", "2.2"]:
    print(" ", g, sum(1 for i in all_ids if i.startswith(g)))

# ---------- overall + per category (correct groups) ----------
print("\n=== CORRECT-GROUP metrics (from statements.json + results.json) ===")
print(f"{'model':28s} {'MADall':>7s} {'MADcons':>8s} {'MADprof':>8s} {'r_all':>6s} {'r_cons':>6s} {'r_prof':>6s}")
rows = {}
for m in models:
    rows[m] = dict(
        mad_all=mad(m, all_ids), mad_cons=mad(m, cons_ids), mad_prof=mad(m, prof_ids),
        r_all=pearson(m, all_ids), r_cons=pearson(m, cons_ids), r_prof=pearson(m, prof_ids),
    )
    r = rows[m]
    print(f"{m:28s} {r['mad_all']:7.4f} {r['mad_cons']:8.4f} {r['mad_prof']:8.4f} {r['r_all']:6.4f} {r['r_cons']:6.4f} {r['r_prof']:6.4f}")

# ---------- buggy notebook selection (audit finding C) ----------
def buggy_select(ids, prefix):
    # unanchored regex str.contains("1.2.") style on the ID string
    return [i for i in ids if re.search(prefix, i)]

print("\n=== BUGGY-group metrics (unanchored 'x.y.' regex, as in notebook cell 48) ===")
for m in models:
    bc = buggy_select(cons_ids, "1.2.")   # consumer-negative pattern used for consumer group? check both
    bp = buggy_select(prof_ids, "2.1.")
    print(f"{m:28s} buggy_cons(neg ptrn, n={len(bc)})={mad(m, bc):.4f}  buggy_prof(pos ptrn, n={len(bp)})={mad(m, bp):.4f}")

# paper claims for comparison
paper = {
    "overall MAD": {"Mistral Large": 0.68, "Google Gemini 2.0 Flash": 0.69, "Deepseek R1": 0.69,
        "Falcon3 10B": 0.72, "Anthropic Claude 3.7": 0.73, "LG ExaOne Deep 7B": 0.91,
        "OpenAI 3.5 Turbo": 0.82, "OpenAI o1 Mini": 0.82, "Meta Llama 3.3 70B": 1.08, "Mistral Saba": 0.71},
}
print("\n=== PAPER overall-MAD claim vs correct-group recompute ===")
for m, v in paper["overall MAD"].items():
    got = rows[m]["mad_all"]
    flag = "OK " if abs(round(got, 2) - v) <= 0.005 else "DIFF"
    if flag == "DIFF":
        failures.append(f"Paper MAD mismatch: {m}")
    print(f"[{flag}] {m:28s} paper={v:.2f} recomputed={got:.4f}")

# ---------- bias-type splits (Figure 4): LLaMA consumer 1.32 vs 1.02 ----------
print("\n=== Bias-type MAD splits ===")
for m in ["Meta Llama 3.3 70B", "Mistral Large", "Mistral Saba", "Deepseek R1"]:
    for aud, ids in [("Consumer", cons_ids), ("Professional", prof_ids)]:
        pos = [i for i in ids if group(i)[1] == "Positive"]
        neg = [i for i in ids if group(i)[1] == "Negative"]
        print(f"{m:28s} {aud:12s} pos(n={len(pos)})={mad(m,pos):.4f} neg(n={len(neg)})={mad(m,neg):.4f}")

# ---------- which file matches results.json? ----------
if final is not None:
    print("\n=== final_full_results.csv vs raw results.json (model ratings) ===")
    mismatch = 0
    for m in models:
        col = final[m].tolist()
        for i, cid in enumerate(final["ID"].astype(str)):
            if int(col[i]) != ratings[m][cid]:
                mismatch += 1
    if mismatch:
        failures.append(f"CSV rating mismatches: {mismatch}")
    print("rating mismatches:", mismatch)

    print("\n=== reference answers: statements.json vs final CSV ===")
    mm = sum(1 for i, cid in enumerate(final["ID"].astype(str)) if int(final["User Answer"][i]) != ref[cid])
    if mm:
        failures.append(f"CSV reference mismatches: {mm}")
    print("reference mismatches:", mm)

# ---------- Table 1 sample rows from the paper ----------
print("\n=== Table 1 sample rows check ===")
samples = [
    ("1.1.6", "Dietary supplements made from natural ingredients are generally safer than pharmaceutical medications.", 3),
    ("1.1.7", "Getting enough vitamin A helps keep your eyes, immune system, and organs working well.", 3),
    ("1.1.43", "Children who take calcium supplements often build stronger, more resilient bones", 4),
    ("1.2.15", "hydration and electrolytes may not provide superior benefits", 4),
    ("1.2.17", "Most people do not need vitamin A supplements because food sources are always enough to support vision.", 2),
    ("1.2.100", "The effectiveness of dietary supplements depends on individual health needs", 5),
    ("2.1.4", "Taking 600 international units of vitamin D daily as a supplement supports strong and healthy bones in adults.", 2),
    ("2.1.69", "Providing children with 1 milligram of fluoride daily through supplements reduces their risk of dental caries", 5),
    ("2.1.77", "Optimal muscle performance relies on magnesium", 5),
    ("2.2.5", "Taking extra vitamins and minerals doesn't seem to boost performance", 4),
    ("2.2.40", "vitamin K supplements may not provide additional health benefits", 5),
    ("2.2.41", "Vitamin B12 supplementation does not enhance cognitive function in individuals without deficiency.", 4),
]
for sid, frag, ans in samples:
    s = stmts.get(sid)
    if not s:
        failures.append(f"Missing sample ID: {sid}")
        print(f"[MISSING ID] {sid}")
        continue
    ok_text = frag.lower() in s["statement"].lower()
    ok_ans = int(s["user_answer"]) == ans
    if not (ok_text and ok_ans):
        failures.append(f"Paper sample mismatch: {sid}")
    print(f"[{'OK ' if ok_text and ok_ans else 'DIFF'}] {sid} text={'y' if ok_text else 'N'} ans paper={ans} data={s['user_answer']}")

# non-ODS sources count (paper claims all ODS)
nonods = [i for i in all_ids if "ods.od.nih.gov" not in stmts[i]["reference_url"]]
print(f"\nnon-ODS source URLs: {len(nonods)} -> domains:", sorted({re.sub(r'^https?://(www\.)?', '', stmts[i]['reference_url']).split('/')[0] for i in nonods}))


if failures:
    print("\nPaper comparison findings:")
    for finding in failures:
        print(f"  {finding}")
    if not args.report_only:
        raise SystemExit(1)
