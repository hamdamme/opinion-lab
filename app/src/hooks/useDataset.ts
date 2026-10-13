import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dataset, Statement } from "@/types";

const ANSWERS_KEY = "opinionlab.answers.v1";

function loadAnswers(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(ANSWERS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function useDataset() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>(loadAnswers);

  useEffect(() => {
    fetch("/data/dataset.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load dataset (${r.status})`);
        return r.json();
      })
      .then(setDataset)
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  const rate = useCallback((id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const unratedCount = useMemo(
    () => (dataset ? dataset.statements.length - Object.keys(answers).length : 0),
    [dataset, answers]
  );

  return { dataset, error, answers, rate, unratedCount };
}

export type DatasetState = ReturnType<typeof useDataset>;
export type { Statement };
