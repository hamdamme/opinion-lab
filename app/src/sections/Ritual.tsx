import { useMemo, useState } from "react";
import type { DatasetState } from "@/hooks/useDataset";
import type { Statement } from "@/types";
import { LIKERT_LABELS } from "@/types";
import { LikertPicker } from "@/components/LikertPicker";
import { RatingCompare } from "@/components/RatingCompare";
import { LiveCompareDialog } from "@/components/LiveCompareDialog";
import { computeStats } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FlaskConical,
  ExternalLink,
  CheckCircle2,
  Scale,
  Lock,
} from "lucide-react";

const BATCH_SIZE = 5;
const BATCH_KEY = "opinionlab.batch.v1";

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

function loadBatch(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(BATCH_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
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
  const [batch, setBatch] = useState<string[]>(loadBatch);
  const [view, setView] = useState<"collect" | "ready" | "compare">(
    loadBatch().length >= BATCH_SIZE ? "ready" : "collect"
  );

  const updateBatch = (b: string[]) => {
    setBatch(b);
    localStorage.setItem(BATCH_KEY, JSON.stringify(b));
  };

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
  /** Statements rated this round — committed, but not yet compared. */
  const pending = current != null && batch.includes(current.id);

  // ---------- round summary (compare view) ----------
  const batchStatements = useMemo(
    () =>
      batch
        .map((id) => dataset?.statements.find((s) => s.id === id))
        .filter((s): s is Statement => !!s),
    [batch, dataset]
  );

  const roundStats = useMemo(() => {
    if (!batchStatements.length || !llmNames.length) return null;
    const mine = computeStats(batchStatements, llmNames, (s) => answers[s.id] ?? null);
    const closest = [...mine].sort((a, b) => a.mae - b.mae)[0];
    const gaps = batchStatements.map((s) => (answers[s.id] ?? 0) - s.reference);
    const bias = gaps.reduce((a, x) => a + x, 0) / gaps.length;
    return { closest, bias };
  }, [batchStatements, llmNames, answers]);

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

  const commit = (v: number) => {
    if (!current) return;
    rate(current.id, v);
    setCurrentId(current.id); // anchor to this statement so the "recorded" card shows
    const b = [...batch.filter((x) => x !== current.id), current.id];
    updateBatch(b);
    setDetailOpen(false);
    if (b.length >= BATCH_SIZE) setView("ready");
  };

  const startNextRound = () => {
    updateBatch([]);
    setView("collect");
    const nxt = pool.find((s) => answers[s.id] == null);
    setCurrentId(nxt?.id ?? null);
    setEvidenceOpen(false);
    setDetailOpen(false);
  };

  if (!dataset) return null;

  // ---------- Round complete — the "ready to compare?" moment ----------
  if (view === "ready") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm sm:p-14">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="mt-5 text-2xl font-bold">Round complete. {BATCH_SIZE} judgments locked in.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            You committed to every answer before seeing a single AI response, exactly how the study's
            human raters worked. Now it's time to see how your judgment compares to the reference rater
            and all {llmNames.length} LLMs.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <Button size="lg" onClick={() => setView("compare")}>
              <Scale className="mr-2 h-4 w-4" /> Ready to compare
            </Button>
            <button
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={startNextRound}
            >
              Discard this round and start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Compare screen ----------
  if (view === "compare") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Your round, compared
          </p>
          {roundStats && (
            <p className="text-sm leading-relaxed">
              Across these {batchStatements.length} statements, the AI closest to your judgment was{" "}
              <Badge className="bg-emerald-600">{roundStats.closest.name}</Badge> (average gap{" "}
              {roundStats.closest.mae.toFixed(2)} points).{" "}
              {Math.abs(roundStats.bias) < 0.15 ? (
                <>Overall you tracked the human reference rater almost exactly.</>
              ) : (
                <>
                  On average you rated{" "}
                  <span className="font-semibold">
                    {Math.abs(roundStats.bias).toFixed(2)} points{" "}
                    {roundStats.bias > 0 ? "more agreeable" : "more skeptical"}
                  </span>{" "}
                  than the reference rater.
                </>
              )}
            </p>
          )}
          <Button className="mt-5" onClick={startNextRound}>
            Start the next round <ChevronUp className="ml-1 h-4 w-4 rotate-90" />
          </Button>
        </div>

        {batchStatements.map((s) => {
          const mine = answers[s.id];
          return (
            <div key={s.id} className="rounded-2xl border bg-card p-6 shadow-sm">
              <blockquote className="text-base leading-relaxed">{s.statement}</blockquote>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                  You: {mine} · {LIKERT_LABELS[mine]}
                </Badge>
                <Badge variant="outline">
                  Reference rater: {s.reference} · {LIKERT_LABELS[s.reference]}
                </Badge>
                <span className="text-muted-foreground">
                  {s.audience} · {s.bias} framing ·{" "}
                  <a href={s.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> source
                  </a>
                </span>
              </div>
              <div className="mt-4">
                <RatingCompare
                  statement={s}
                  llmNames={llmNames}
                  reference={s.reference}
                  highlightName="Bars show each model vs the reference mark"
                />
              </div>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setLiveOpen(s)}>
                <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
                Compare a live model (bring your own key)
              </Button>
            </div>
          );
        })}

        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setView("ready")}>
            <ChevronUp className="mr-1 h-4 w-4 -rotate-90" /> Back to the summary
          </Button>
        </div>

        <LiveCompareDialog ds={ds} statement={liveOpen} onClose={() => setLiveOpen(null)} />
      </div>
    );
  }

  if (!current) return null;

  // ---------- Collecting: just committed, waiting to move on ----------
  if (pending && myAnswer != null) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-10">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h2 className="mt-4 text-xl font-semibold">Recorded.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            That&apos;s {batch.length} of {BATCH_SIZE} this round. Nice pace, the comparison is getting
            closer.
          </p>
          <Button className="mt-6" onClick={next}>
            Next statement <ChevronUp className="ml-1 h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Collecting: statement already rated in a previous round ----------
  if (myAnswer != null && reveal) {
    return (
      <div className="mx-auto max-w-2xl">
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

        <div className="rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            You rated this one before
          </p>
          <blockquote className="text-xl leading-relaxed sm:text-2xl">{current.statement}</blockquote>

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
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{llmNames.length} AIs · average</div>
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
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Statements are drawn from a curated research bank of {dataset.statements.length}, each paired with a scientific source.
        </p>

        <LiveCompareDialog ds={ds} statement={liveOpen} onClose={() => setLiveOpen(null)} />
      </div>
    );
  }

  // ---------- Collecting: unrated statement — commit first, compare later ----------
  return (
    <div className="mx-auto max-w-2xl">
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Round: <span className="font-semibold text-foreground">{batch.length}/{BATCH_SIZE}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={next} className="text-xs text-muted-foreground">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Skip
          </Button>
        </div>
      </div>

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
              Read it before you rate, or rate from what you already know. Both are informative.
            </p>
          </CollapsibleContent>
        </Collapsible>

        {/* Your rating — the commitment */}
        <div className="mt-8">
          <LikertPicker value={myAnswer} onChange={commit} />
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            {BATCH_SIZE - batch.length > 0 ? (
              <>
                Commit to {BATCH_SIZE - batch.length} more statement{BATCH_SIZE - batch.length === 1 ? "" : "s"} to unlock the
                AI comparison. Your judgment comes first.
              </>
            ) : (
              <>Your judgment comes first. AI answers stay locked until your round is complete.</>
            )}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Statements are drawn from a curated research bank of {dataset.statements.length}, each paired with a scientific source.
      </p>
    </div>
  );
}
