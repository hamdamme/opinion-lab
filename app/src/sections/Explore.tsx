import { useMemo, useState } from "react";
import type { DatasetState } from "@/hooks/useDataset";
import type { Statement } from "@/types";
import { LikertPicker } from "@/components/LikertPicker";
import { RatingCompare, SourceLink } from "@/components/RatingCompare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExploreProps {
  ds: DatasetState;
  onOpenLive: (s: Statement) => void;
}

export function Explore({ ds, onOpenLive }: ExploreProps) {
  const { dataset, answers, rate } = ds;
  const [audience, setAudience] = useState("all");
  const [bias, setBias] = useState("all");
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [unratedOnly, setUnratedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const topics = useMemo(
    () => (dataset ? Array.from(new Set(dataset.statements.map((s) => s.topic))).sort() : []),
    [dataset]
  );

  const filtered = useMemo(() => {
    if (!dataset) return [];
    const q = query.trim().toLowerCase();
    return dataset.statements.filter((s) => {
      if (audience !== "all" && s.audience !== audience) return false;
      if (bias !== "all" && s.bias !== bias) return false;
      if (topic !== "all" && s.topic !== topic) return false;
      if (unratedOnly && answers[s.id] != null) return false;
      if (q && !s.statement.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [dataset, audience, bias, topic, query, unratedOnly, answers]);

  const current: Statement | null =
    filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? null;

  const idx = current ? filtered.findIndex((s) => s.id === current.id) : -1;
  const llmNames = dataset?.llms.map((l) => l.name) ?? [];
  const myAnswer = current ? (answers[current.id] ?? null) : null;
  const ratedCount = Object.keys(answers).length;

  if (!dataset) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Filter + list panel */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All audiences</SelectItem>
              <SelectItem value="Consumer">Consumer</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bias} onValueChange={setBias}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All biases</SelectItem>
              <SelectItem value="Positive">Pro-supplement</SelectItem>
              <SelectItem value="Negative">Anti-supplement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger><SelectValue placeholder="All topics" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All topics ({topics.length})</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search statements…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={unratedOnly} onCheckedChange={(v) => setUnratedOnly(!!v)} />
          Unrated only
        </label>

        <div className="text-xs text-muted-foreground">
          {filtered.length} statements · you rated {ratedCount}/{dataset.statements.length}
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(ratedCount / dataset.statements.length) * 100}%` }}
          />
        </div>

        <div className="h-[420px] overflow-y-auto rounded-md border divide-y divide-border/60">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent",
                current?.id === s.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">{s.id}</span>
                {answers[s.id] != null && (
                  <span className="ml-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    {answers[s.id]}
                  </span>
                )}
              </div>
              <div className="line-clamp-2 text-muted-foreground">{s.statement}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No statements match the filters.</div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div>
        {current ? (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{current.id}</Badge>
                <Badge variant={current.audience === "Consumer" ? "default" : "outline"}>
                  {current.audience}
                </Badge>
                <Badge variant={current.bias === "Positive" ? "default" : "destructive"} className={current.bias === "Positive" ? "bg-emerald-600" : ""}>
                  {current.bias === "Positive" ? "Pro-supplement" : "Anti-supplement"}
                </Badge>
                <Badge variant="outline">{current.topic}</Badge>
              </div>

              <p className="text-lg leading-relaxed">{current.statement}</p>

              <div className="rounded-md border bg-muted/40 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Evidence source
                </div>
                <SourceLink url={current.source} topic={current.topic} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Read the reference before rating — the same sources were provided to the LLMs.
                </p>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">
                  Your rating {myAnswer != null && <span className="text-muted-foreground font-normal">— saved locally</span>}
                </div>
                <LikertPicker value={myAnswer} onChange={(v) => rate(current.id, v)} />
              </div>

              {myAnswer != null ? (
                <div className="rounded-md border p-4 space-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">
                      How {llmNames.length} LLMs rated this statement
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => onOpenLive(current)}>
                      <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
                      Compare a live LLM
                    </Button>
                  </div>
                  <RatingCompare
                    statement={current}
                    llmNames={llmNames}
                    reference={current.reference}
                  />
                  <p className="pt-3 text-xs text-muted-foreground">
                    Bars show each LLM's rating (1–5); the dark tick is the study reference rater.
                    Green = exact agreement, amber = off by 1, red = off by 2+.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Rate the statement above to unlock the LLM comparison.
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={idx <= 0}
                  onClick={() => setSelectedId(filtered[idx - 1]?.id)}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Prev
                </Button>
                <span className="text-xs text-muted-foreground">{idx + 1} / {filtered.length}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={idx >= filtered.length - 1}
                  onClick={() => setSelectedId(filtered[idx + 1]?.id)}
                >
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card><CardContent className="pt-6 text-sm text-muted-foreground">
            Select a statement to begin.
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
