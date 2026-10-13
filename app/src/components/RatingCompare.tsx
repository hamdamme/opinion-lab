import type { Statement } from "@/types";
import { LIKERT_LABELS } from "@/types";
import { deviationClass } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface RatingCompareProps {
  statement: Statement;
  llmNames: string[];
  /** Reference rating to compare against (study rater or current user) */
  reference: number;
  /** Optional live result to append (e.g. from the Live Compare panel) */
  live?: { name: string; rating: number | null } | null;
  highlightName?: string;
}

function Row({ name, rating, reference }: { name: string; rating: number; reference: number }) {
  const d = rating - reference;
  const width = (rating / 5) * 100;
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-44 shrink-0 truncate text-sm" title={name}>
        {name}
      </div>
      <div className="relative h-5 flex-1 rounded bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded transition-all",
            d === 0
              ? "bg-emerald-500/80"
              : Math.abs(d) === 1
                ? "bg-amber-500/80"
                : "bg-red-500/80"
          )}
          style={{ width: `${width}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/70"
          style={{ left: `${(reference / 5) * 100}%` }}
          title={`Reference: ${reference}`}
        />
      </div>
      <div className="w-8 text-right text-sm font-semibold">{rating}</div>
      <div className={cn("w-14 text-right text-xs font-medium", deviationClass(d))}>
        {d === 0 ? "exact" : d > 0 ? `+${d} over` : `${d} under`}
      </div>
    </div>
  );
}

export function RatingCompare({ statement, llmNames, reference, live, highlightName }: RatingCompareProps) {
  const rows = llmNames.map((n) => ({ name: n, rating: statement.ratings[n] }));
  if (live?.rating != null) rows.push({ name: `★ ${live.name} (live)`, rating: live.rating });

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <Badge variant="outline">Reference: {reference} · {LIKERT_LABELS[reference]}</Badge>
        <span className="inline-block h-3 w-0.5 bg-foreground/70" /> = reference mark
        {highlightName && <Badge className="ml-auto">{highlightName}</Badge>}
      </div>
      <div className="divide-y divide-border/50">
        {rows.map((r) => (
          <Row key={r.name} {...r} reference={reference} />
        ))}
      </div>
    </div>
  );
}

export function SourceLink({ url, topic }: { url: string; topic: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      Check the source · {topic}
    </a>
  );
}
