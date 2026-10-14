import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Database, ShieldCheck, FileCheck2 } from "lucide-react";

const BLOCKS = [
  {
    icon: BookOpen,
    title: "The study",
    body: "400 Likert-scale statements about dietary supplements, each paired with an evidence source, primarily NIH Office of Dietary Supplements fact sheets, with a small number from NCCIH, PubMed Central, and other public health sources. Statements are balanced across audience (consumer / health professional) and framing (favoring / questioning supplements), 100 per group. Ten frontier LLMs rated every statement zero-shot with a shared prompt template: 4,000 ratings.",
  },
  {
    icon: Database,
    title: "The data",
    body: "The statement bank and every evaluation run are versioned public data (CC BY 4.0). Run 1 (April 2025) covers ten models. New runs are added as the platform evolves, so the public record extends over time instead of being rewritten. Cite as: Aynazarov, H. (2026). Dietary Supplement Opinion Lab Dataset (v1.0). https://doi.org/10.5281/zenodo.23357963",
  },
  {
    icon: FileCheck2,
    title: "Verification",
    body: "Every published metric was recomputed independently from the raw collection. The audit confirmed dataset integrity (four groups of exactly 100; 4,000 complete ratings) and all headline values, and it caught and corrected a subgroup-selection defect in the original analysis (one bias-gap figure was misprinted and has been fixed). The full verification report ships in the repository.",
  },
  {
    icon: ShieldCheck,
    title: "How to read the numbers",
    body: "All metrics here describe agreement between model ratings and human reference ratings. They are not measures of factual or medical correctness, and a single integer rating never reveals a model's reasoning. This platform is for research and education; it does not provide medical or nutritional advice.",
  },
];

export function About() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">About this platform</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Opinion Lab is a living evaluation instrument built on a master's research project
          at Northeastern Illinois University (2025), maintained and extended by its author.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {BLOCKS.map((b) => (
          <Card key={b.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <b.icon className="h-4 w-4 text-emerald-600" /> {b.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">{b.body}</CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm">
        <a
          className="font-medium text-primary hover:underline"
          href="https://github.com/hamdamme/opinion-lab"
          target="_blank"
          rel="noreferrer"
        >
          Source, data, and verification report on GitHub ↗
        </a>
      </p>
    </div>
  );
}
