import type { LLMStats, Statement } from "@/types";

/**
 * Compute per-LLM agreement statistics against a reference answer per statement.
 * `refFor` returns the reference rating for a statement (study rater or the app's user).
 */
export function computeStats(
  statements: Statement[],
  llmNames: string[],
  refFor: (s: Statement) => number | null
): LLMStats[] {
  const acc: Record<
    string,
    { n: number; exact: number; within1: number; abs: number; signed: number; over: number; under: number }
  > = {};
  for (const name of llmNames) {
    acc[name] = { n: 0, exact: 0, within1: 0, abs: 0, signed: 0, over: 0, under: 0 };
  }

  for (const s of statements) {
    const ref = refFor(s);
    if (ref == null) continue;
    for (const name of llmNames) {
      const r = s.ratings[name];
      if (r == null) continue;
      const d = r - ref;
      const a = acc[name];
      a.n += 1;
      if (d === 0) a.exact += 1;
      if (Math.abs(d) <= 1) a.within1 += 1;
      a.abs += Math.abs(d);
      a.signed += d;
      if (d > 0) a.over += 1;
      if (d < 0) a.under += 1;
    }
  }

  return llmNames.map((name) => {
    const a = acc[name];
    const n = Math.max(a.n, 1);
    return {
      name,
      n: a.n,
      exact: a.exact / n,
      within1: a.within1 / n,
      mae: a.abs / n,
      bias: a.signed / n,
      over: a.over / n,
      under: a.under / n,
    };
  });
}

export function deviationClass(d: number): string {
  if (d === 0) return "text-emerald-600 dark:text-emerald-400";
  if (Math.abs(d) === 1) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}
