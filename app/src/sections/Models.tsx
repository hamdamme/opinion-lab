import { useState } from "react";
import type { DatasetState } from "@/hooks/useDataset";
import { LIKERT_LABELS, type Statement } from "@/types";
import { RatingCompare } from "@/components/RatingCompare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function ModelsSection({ ds }: { ds: DatasetState }) {
  const { dataset } = ds;
  if (!dataset) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {dataset.llms.map((l) => (
        <Card key={l.name} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{l.name}</CardTitle>
              <Badge variant="secondary">{l.provider}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-1.5 flex-1">
            <Meta k="Region" v={l.region} />
            <Meta k="Parameters" v={l.params} />
            <Meta k="Context" v={l.context} />
            <Meta k="Architecture" v={l.architecture} />
            <Meta k="License" v={l.license} />
            <Meta k="Access" v={l.access} />
            <Meta k="Instruction following" v={l.instruction} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Meta({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}

/* ---------------- Live compare dialog ---------------- */

interface LiveProps {
  ds: DatasetState;
  statement: Statement | null;
  onClose: () => void;
}

const KEY_KEY = "opinionlab.livecfg";

function loadCfg() {
  try {
    return JSON.parse(localStorage.getItem(KEY_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function LiveCompareDialog({ ds, statement, onClose }: LiveProps) {
  const [cfg, setCfg] = useState<{ baseUrl?: string; apiKey?: string; model?: string }>(loadCfg);
  const [result, setResult] = useState<{ rating: number; raw: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const llmNames = ds.dataset?.llms.map((l) => l.name) ?? [];

  const run = async () => {
    if (!statement) return;
    setLoading(true);
    setError(null);
    setResult(null);
    localStorage.setItem(KEY_KEY, JSON.stringify(cfg));
    const base = (cfg.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    const system =
      "You are evaluating a dietary-supplement-related statement. Rate how much you agree with the statement on a 1-5 Likert scale, where 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree. Base your judgment on established scientific evidence about dietary supplements. Reply with ONLY a single integer from 1 to 5.";
    const user = `Statement: "${statement.statement}"\n\nReference source: ${statement.source}\n\nYour rating (1-5):`;
    try {
      const resp = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
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
      if (!resp.ok) throw new Error(`API error ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
      const data = await resp.json();
      const text: string = data.choices?.[0]?.message?.content ?? "";
      const m = text.match(/[1-5]/);
      if (!m) throw new Error(`Could not parse a 1-5 rating from the model reply: "${text.slice(0, 120)}"`);
      setResult({ rating: Number(m[0]), raw: text.trim() });
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!statement} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Live LLM comparison</DialogTitle>
          <DialogDescription>
            Send this statement to any OpenAI-compatible endpoint and compare its live rating with the
            ten LLMs from the study. Your key is stored only in this browser.
          </DialogDescription>
        </DialogHeader>

        {statement && (
          <div className="space-y-4">
            <blockquote className="rounded-md border-l-4 border-primary/40 bg-muted/40 p-3 text-sm">
              {statement.statement}
              <footer className="mt-1 text-xs text-muted-foreground">
                {statement.id} · {statement.topic} ·{" "}
                <a className="text-primary hover:underline" href={statement.source} target="_blank" rel="noreferrer">
                  reference source
                </a>
              </footer>
            </blockquote>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1 space-y-1.5">
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

            <Button
              onClick={run}
              disabled={loading || !cfg.apiKey || !cfg.model}
              className="w-full sm:w-auto"
            >
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
                  <span className="font-semibold">{cfg.model}</span> rated{" "}
                  <Badge className="mx-1">{result.rating} — {LIKERT_LABELS[result.rating]}</Badge>
                  vs study reference {statement.reference} (
                  {result.rating - statement.reference === 0
                    ? "exact agreement"
                    : `off by ${Math.abs(result.rating - statement.reference)}`})
                </div>
                <RatingCompare
                  statement={statement}
                  llmNames={llmNames}
                  reference={statement.reference}
                  live={{ name: cfg.model ?? "live", rating: result.rating }}
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
