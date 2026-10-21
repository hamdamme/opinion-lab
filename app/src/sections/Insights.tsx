import { useMemo } from "react";
import type { DatasetState } from "@/hooks/useDataset";
import { computeStats, pct } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRound, Sigma } from "lucide-react";

export function Insights({ ds }: { ds: DatasetState }) {
  const { dataset, answers } = ds;

  const stats = useMemo(() => {
    if (!dataset) return { study: [], mine: [] };
    const names = dataset.llms.map((l) => l.name);
    const study = computeStats(dataset.statements, names, (s) => s.reference).sort(
      (a, b) => b.exact - a.exact || a.mae - b.mae
    );
    const n = Object.keys(answers).length;
    const mine = n >= 5 ? computeStats(dataset.statements, names, (s) => answers[s.id] ?? null) : [];
    return { study, mine, n };
  }, [dataset, answers]);

  const persona = useMemo(() => {
    if (!dataset) return null;
    const myRated = dataset.statements.filter((s) => answers[s.id] != null);
    if (!myRated.length) return null;
    const names = dataset.llms.map((l) => l.name);
    const myMean = myRated.reduce((a, s) => a + answers[s.id], 0) / myRated.length;
    const refMean = myRated.reduce((a, s) => a + s.reference, 0) / myRated.length;
    const bias = myMean - refMean;
    const cautiousVs = names.filter((n) => {
      const m = myRated.reduce((a, s) => a + s.ratings[n], 0) / myRated.length;
      return m > myMean;
    }).length;
    return { bias, cautiousVs, nModels: names.length };
  }, [dataset, answers]);

  if (!dataset) return null;
  const n = Object.keys(answers).length;

  const closest = stats.mine.length
    ? [...stats.mine].sort((a, b) => a.mae - b.mae)[0]
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {n >= 5 && closest && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4 text-emerald-600" /> Your agreement profile ({n} statements rated)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Across the statements you rated, the AI closest to your judgment is{" "}
              <Badge className="bg-emerald-600">{closest.name}</Badge>, with an average gap of{" "}
              <span className="font-semibold">{closest.mae.toFixed(2)}</span> points, exact agreement{" "}
              {pct(closest.exact)}. Your ratings serve as the reference here; this is a description of
              similarity, not of correctness.
            </p>
            {persona && (
              <p className="mt-3">
                Your personal read: on average you rate{" "}
                {Math.abs(persona.bias) < 0.15 ? (
                  <>almost exactly in step with the human reference rater</>
                ) : (
                  <>
                    <span className="font-semibold">
                      {Math.abs(persona.bias).toFixed(2)} points{" "}
                      {persona.bias > 0 ? "more agreeable" : "more skeptical"}
                    </span>{" "}
                    than the reference rater
                  </>
                )}
                , and you are more cautious than{" "}
                <span className="font-semibold">
                  {persona.cautiousVs} of {persona.nModels}
                </span>{" "}
                models.
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Rate more statements for a stabler picture. Everything stays in your browser.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sigma className="h-4 w-4 text-emerald-600" /> Model agreement with the human reference raters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Exact match</TableHead>
                <TableHead className="text-right">Within ±1</TableHead>
                <TableHead className="text-right">Avg. gap (MAD)</TableHead>
                <TableHead className="text-right">Tendency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.study.map((s, i) => (
                <TableRow key={s.name}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right">{pct(s.exact)}</TableCell>
                  <TableCell className="text-right">{pct(s.within1)}</TableCell>
                  <TableCell className="text-right">{s.mae.toFixed(3)}</TableCell>
                  <TableCell className="text-right">
                    <span className={s.bias > 0.05 ? "text-emerald-600" : s.bias < -0.05 ? "text-red-500" : "text-muted-foreground"}>
                      {s.bias > 0.05 ? "agrees more" : s.bias < -0.05 ? "agrees less" : "balanced"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Reference ratings come from a knowledgeable consumer (consumer statements) and a registered
            dietitian (professional statements). Metrics measure agreement patterns, not factual or
            medical correctness. Recomputed from the published dataset by{" "}
            <code className="text-[11px]">analysis/compute_metrics.py</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

