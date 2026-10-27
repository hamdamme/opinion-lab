import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dataset, Statement } from "@/types";
import { cleanAnswers, readStored, removeStored, writeStored } from "@/lib/browserState";

const ANSWERS_KEY = "opinionlab.answers.v1";

export function useDataset() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storedAnswers, setAnswers] = useState(() => cleanAnswers(readStored(ANSWERS_KEY)));
  const allowed = useMemo(() => new Set(dataset?.statements.map(s => s.id) ?? []), [dataset]);
  const answers = useMemo(() => cleanAnswers(storedAnswers, allowed), [storedAnswers, allowed]);

  useEffect(() => {
    // Remove credentials persisted by earlier versions; never read or reuse them.
    removeStored("opinionlab.livecfg");
    const controller = new AbortController();
    fetch("/data/dataset.json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load dataset (${r.status})`);
        return r.json();
      })
      .then(setDataset)
      .catch((e) => { if (!controller.signal.aborted) setError(String(e)); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (dataset) writeStored(ANSWERS_KEY, answers);
  }, [dataset, answers]);

  const rate = useCallback((id: string, value: number) => {
    if (!allowed.has(id) || !Number.isInteger(value) || value < 1 || value > 5) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, [allowed]);

  const unratedCount = dataset ? dataset.statements.length - Object.keys(answers).length : 0;
  return { dataset, error, answers, rate, unratedCount };
}

export type DatasetState = ReturnType<typeof useDataset>;
export type { Statement };
