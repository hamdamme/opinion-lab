import { useMemo, useState } from "react";
import type { DatasetState } from "@/hooks/useDataset";
import type { Statement } from "@/types";
import { LikertPicker } from "@/components/LikertPicker";
import { RatingCompare } from "@/components/RatingCompare";
import { LiveCompareDialog } from "@/components/LiveCompareDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, RotateCcw, FlaskConical, ExternalLink } from "lucide-react";

/** Deterministic shuffle so the statement order is stable within a session. */
function shuffled<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface RitualProps {
  ds: DatasetState;
}

export function Ritual({ ds }: RitualProps) {
  const { dataset, answers, rate } = ds;
  const [topic, setTopic] = useState("all");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState<Statement | null>(null);

  const topics = useMemo(
    () => (dataset ? Array.from(new Set(dataset.statements.map((s) => s.topic))).sort() : []),
    [dataset]
  );

  const pool = useMemo(() => {
    if (!dataset) return [];
    const base = topic === "all" ? dataset.statements : dataset.statements.filter((s) => s.topic === topic);
    // Prefer unseen statements first, then a stable shuffled order.
    const seed = topic === "all" ? 42 : [...topic].reduce((a, c) => a + c.charCodeAt(0), 7);
    const unseen = shuffled(base.filter((s) => answers[s.id] == null), seed);
    const seen = shuffled(base.filter((s) => answers[s.id] != null), seed + 1);
    return [...unseen, ...seen];
  }, [dataset, topic, answers]);

  const current: Statement | null = pool.find((s) => s.id === currentId) ?? pool[0] ?? null;
  const myAnswer = current ? (answers[current.id] ?? null) : null;
  const llmNames = dataset?.llms.map((l) => l.name) ?? [];

  const reveal = useMemo(() => {
    if (!current || myAnswer == null) return null;
    const ratings = llmNames.map((n) => ({ name: n, r: current.ratings[n] }));
    const mean = ratings.reduce((a, x) => a + x.r, 0) / ratings.length;
    const closest = ratings.reduce((a, x) => (Math.abs(x.r - myAnswer) < Math.abs(a.r - myAnswer) ? x : a));
    const refGap = myAnswer - current.reference;
    return {
      mean,
      min: Math.min(...ratings.map((x) => x.r)),
      max: Math.max(...ratings.map((x) => x.r)),
      closest,
      refGap,
    };
  }, [current, myAnswer, llmNames]);

  const next = () => {
    if (!current) return;
    const i = pool.findIndex((s) => s.id === current.id);
    setCurrentId(pool[(i + 1) % pool.length]?.id ?? null);
    setEvidenceOpen(false);
    setDetailOpen(false);
  };

  if (!dataset || !current) return null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Topic picker — deliberately quiet */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Select value={topic} onValueChange={(v) => { setTopic(v); setCurrentId(null); setDetailOpen(false); }}>
          <SelectTrigger className="h-8 w-[220px] text-xs text-muted-foreground">
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Any topic</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={next} className="text-xs text-muted-foreground">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New statement
        </Button>
      </div>

      {/* The question */}
      <div className="rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Do you agree with this claim?
        </p>
        <blockquote className="text-xl leading-relaxed sm:text-2xl">{current.statement}</blockquote>

        {/* Evidence — one tap away, never forced */}
        <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen} className="mt-6">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              {evidenceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {evidenceOpen ? "Hide the evidence" : "Check the evidence first"}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 rounded-lg border bg-muted/40 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Source · {current.topic}
            </div>
            <a
              href={current.source}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {current.source.replace(/^https?:\/\//, "")}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Read it before you rate — or rate from what you already know. Both are informative.
            </p>
          </CollapsibleContent>
        </Collapsible>

        {/* Your rating */}
        <div className="mt-8">
          <LikertPicker value={myAnswer} onChange={(v) => { rate(current.id, v); setDetailOpen(false); }} />
          {myAnswer == null && (
            <p className="mt-2 text-xs text-muted-foreground">
              Your answer stays in this browser — it unlocks the AI comparison.
            </p>
          )}
        </div>

        {/* The reveal */}
        {myAnswer != null && reveal && (
          <div className="mt-8 border-t pt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">You</div>
                <div className="text-2xl font-semibold">{myAnswer}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Reference rater</div>
                <div className="text-2xl font-semibold">{current.reference}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">10 AIs · average</div>
                <div className="text-2xl font-semibold">{reveal.mean.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">AI range</div>
                <div className="text-2xl font-semibold">
                  {reveal.min}–{reveal.max}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Closest AI to you: <span className="font-medium text-foreground">{reveal.closest.name}</span> (rated {reveal.closest.r}).
              {reveal.refGap === 0
                ? " You matched the reference rater."
                : ` You were ${Math.abs(reveal.refGap)} point${Math.abs(reveal.refGap) > 1 ? "s" : ""} ${reveal.refGap > 0 ? "more agreeable" : "more skeptical"} than the reference rater.`}
            </p>

            <Collapsible open={detailOpen} onOpenChange={setDetailOpen} className="mt-4">
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {detailOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Per-model detail
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <RatingCompare statement={current} llmNames={llmNames} reference={current.reference} />
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setLiveOpen(current)}>
                  <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
                  Compare a live model (bring your own key)
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-6 flex justify-end">
              <Button onClick={next}>
                Next statement <ChevronUp className="ml-1 h-4 w-4 rotate-90" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Statements are drawn from a curated research bank of {dataset.statements.length}, each paired with a scientific source.
      </p>

      <LiveCompareDialog ds={ds} statement={liveOpen} onClose={() => setLiveOpen(null)} />
    </div>
  );
}
