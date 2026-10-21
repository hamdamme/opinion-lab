"""Validate the archived study before computing or publishing results."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPECTED_IDS = {f"{a}.{b}.{i}" for a in (1, 2) for b in (1, 2) for i in range(1, 101)}
EXPECTED_MAD = {
    "OpenAI 3.5 Turbo": 0.8200, "Anthropic Claude 3.7": 0.7300,
    "Meta Llama 3.3 70B": 1.0800, "OpenAI o1 Mini": 0.8225,
    "Google Gemini 2.0 Flash": 0.6950, "Mistral Large": 0.6775,
    "Mistral Saba": 0.7100, "Deepseek R1": 0.6900,
    "Falcon3 10B": 0.7200, "LG ExaOne Deep 7B": 0.9125,
}


def rating(value):
    if isinstance(value, bool) or str(value) not in {"1", "2", "3", "4", "5"}:
        raise ValueError(f"Invalid rating: {value!r}")
    return int(value)


def validate(statements, results):
    ids = [s["id"] for s in statements]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate statement IDs")
    if set(ids) != EXPECTED_IDS:
        raise ValueError("Expected four groups of 100 statement IDs")
    if set(results) != set(EXPECTED_MAD):
        raise ValueError("Model names do not match the archived study")
    refs = {}
    for s in statements:
        refs[s["id"]] = rating(s["user_answer"])
        if not s["statement"].strip() or not s["reference_url"].startswith(("https://", "http://")):
            raise ValueError(f"Missing statement or source: {s['id']}")
    for model, values in results.items():
        if set(values) != EXPECTED_IDS:
            raise ValueError(f"Missing or extra ratings: {model}")
        mad = sum(abs(rating(values[i]) - refs[i]) for i in EXPECTED_IDS) / 400
        if abs(mad - EXPECTED_MAD[model]) > 1e-10:
            raise ValueError(f"Archived MAD changed: {model}: {mad}")


def load_and_validate():
    statements = json.loads((ROOT / "data/statements.json").read_text())
    results = json.loads((ROOT / "data/runs/run-2025-04/results.json").read_text())
    validate(statements, results)
    return statements, results


if __name__ == "__main__":
    load_and_validate()
    print("Validated 400 statements and 4000 model ratings against the archived study.")
