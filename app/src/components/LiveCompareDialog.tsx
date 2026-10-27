import { useEffect, useRef, useState } from "react";
import { liveEndpoint, parseLiveRating } from "@/lib/liveRating";
import type { DatasetState } from "@/hooks/useDataset";
import { LIKERT_LABELS, type Statement } from "@/types";
import { RatingCompare } from "@/components/RatingCompare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface LiveProps {
  ds: DatasetState;
  statement: Statement | null;
  onClose: () => void;
}

export function LiveCompareDialog({ ds, statement, onClose }: LiveProps) {
  return statement ? <LiveSession key={statement.id} ds={ds} statement={statement} onClose={onClose} /> : null;
}

function LiveSession({ ds, statement, onClose }: LiveProps & { statement: Statement }) {
  const [cfg, setCfg] = useState<{ baseUrl?: string; apiKey?: string; model?: string }>({});
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const [result, setResult] = useState<{ rating: number; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const llmNames = ds.dataset?.llms.map((l) => l.name) ?? [];

  const run = async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    setResult(null);
    const system =
      "You are evaluating a dietary-supplement-related statement. Rate how much you agree with the statement on a 1-5 Likert scale, where 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree. Base your judgment on established scientific evidence about dietary supplements. Reply with ONLY a single integer from 1 to 5.";
    const user = `Statement: "${statement.statement}"\n\nReference source: ${statement.source}\n\nYour rating (1-5):`;
    try {
      const resp = await fetch(liveEndpoint(cfg.baseUrl ?? ""), {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0,
          max_tokens: 8,
        }),
      });
      if (!resp.ok) throw new Error(`The endpoint returned HTTP ${resp.status}. Check the endpoint, model, and credentials.`);
      const data = await resp.json();
      const rating = parseLiveRating(data.choices?.[0]?.message?.content);
      if (!controller.signal.aborted) setResult({ rating, model: cfg.model ?? "live" });
    } catch (e) {
      if (!controller.signal.aborted) setError(String(e instanceof Error ? e.message : e));
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <Dialog open={!!statement} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Live model comparison</DialogTitle>
          <DialogDescription>
            This sends the displayed statement, source URL, and API key directly to the HTTPS endpoint
            you choose. The key stays in memory while this dialog is open and is not saved.
            Provider charges may apply. This exploratory prompt differs from the archived study
            prompt, so the results do not represent identical evaluation conditions.
          </DialogDescription>
        </DialogHeader>

        {statement && (
          <div className="space-y-4">
            <blockquote className="rounded-md border-l-4 border-primary/40 bg-muted/40 p-3 text-sm">
              {statement.statement}
              <footer className="mt-1 text-xs text-muted-foreground">
                <a className="text-primary hover:underline" href={statement.source} target="_blank" rel="noreferrer">
                  reference source
                </a>
              </footer>
            </blockquote>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="base">Base URL</Label>
                <Input id="base" placeholder="https://api.openai.com/v1"
                  value={cfg.baseUrl ?? ""} onChange={(e) => setCfg({ ...cfg, baseUrl: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="gpt-4o-mini"
                  value={cfg.model ?? ""} onChange={(e) => setCfg({ ...cfg, model: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="key">API key</Label>
                <Input id="key" type="password" placeholder="sk-…"
                  value={cfg.apiKey ?? ""} onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })} />
              </div>
            </div>

            <Button onClick={run} disabled={loading || !cfg.apiKey || !cfg.model} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Querying model…" : "Get live rating"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-3">
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-semibold">{result.model}</span> rated{" "}
                  <Badge className="mx-1">{result.rating} · {LIKERT_LABELS[result.rating]}</Badge>
                  vs study reference {statement.reference} (
                  {result.rating - statement.reference === 0
                    ? "exact agreement"
                    : `off by ${Math.abs(result.rating - statement.reference)}`})
                </div>
                <RatingCompare
                  statement={statement}
                  llmNames={llmNames}
                  reference={statement.reference}
                  live={{ name: result.model, rating: result.rating }}
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
