"""Build the static app dataset from versioned research inputs."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATEMENTS_PATH = ROOT / "data/statements.json"
RESULTS_PATH = ROOT / "data/runs/run-2025-04/results.json"
METADATA_PATH = ROOT / "data/app_metadata.json"
OUTPUT_PATH = ROOT / "app/public/data/dataset.json"

GROUPS = {
    ("1", "1"): ("Consumer", "Positive"),
    ("1", "2"): ("Consumer", "Negative"),
    ("2", "1"): ("Professional", "Positive"),
    ("2", "2"): ("Professional", "Negative"),
}


def build_dataset(statements, results, metadata):
    statement_ids = [statement["id"] for statement in statements]
    if len(statement_ids) != len(set(statement_ids)):
        raise ValueError("Canonical statement bank contains duplicate IDs")

    topics = metadata["topics"]
    ids = set(statement_ids)
    if set(topics) != ids:
        raise ValueError("App topic metadata IDs do not match the canonical statement bank")

    models = metadata["llms"]
    model_names = [model["name"] for model in models]
    if len(model_names) != len(set(model_names)) or set(model_names) != set(results):
        raise ValueError("App model metadata does not match the evaluation run")
    for model_name in model_names:
        if set(results[model_name]) != ids:
            raise ValueError(f"Rating IDs do not match the canonical statement bank: {model_name}")
        if any(isinstance(value, bool) or str(value) not in {"1", "2", "3", "4", "5"}
               for value in results[model_name].values()):
            raise ValueError(f"Invalid model rating: {model_name}")

    output_statements = []
    for statement in statements:
        statement_id = statement["id"]
        parts = statement_id.split(".")
        if len(parts) != 3 or (parts[0], parts[1]) not in GROUPS:
            raise ValueError(f"Invalid statement ID: {statement_id}")
        audience, bias = GROUPS[(parts[0], parts[1])]

        ratings = {}
        for model_name in model_names:
            if statement_id not in results[model_name]:
                raise ValueError(f"Missing rating for {model_name}: {statement_id}")
            ratings[model_name] = int(results[model_name][statement_id])

        output_statements.append({
            "id": statement_id,
            "statement": statement["statement"],
            "source": statement["reference_url"],
            "topic": topics[statement_id],
            "audience": audience,
            "bias": bias,
            "reference": int(statement["user_answer"]),
            "ratings": ratings,
        })

    return {"statements": output_statements, "llms": models}


def serialized_dataset():
    statements = json.loads(STATEMENTS_PATH.read_text(encoding="utf-8"))
    results = json.loads(RESULTS_PATH.read_text(encoding="utf-8"))
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    return json.dumps(build_dataset(statements, results, metadata), ensure_ascii=False, indent=1) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if the checked-in app dataset is stale")
    args = parser.parse_args()

    expected = serialized_dataset()
    if args.check:
        if not OUTPUT_PATH.exists() or OUTPUT_PATH.read_text(encoding="utf-8") != expected:
            raise SystemExit("App dataset is stale. Run: python analysis/build_app_dataset.py")
        print("App dataset matches the canonical statements, ratings, and metadata.")
        return

    OUTPUT_PATH.write_text(expected, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
