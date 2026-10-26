import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Database, ShieldCheck, FileCheck2 } from "lucide-react";

const BLOCKS = [
  {
    icon: BookOpen,
    title: "The study",
    body: "400 Likert-scale statements about dietary supplements, each paired with an evidence source, primarily NIH Office of Dietary Supplements fact sheets, with a small number from NCCIH, PubMed Central, and other public health sources. Statements are balanced across audience (consumer / health professional) and framing (favoring / questioning supplements), 100 per group. Ten language models rated every statement with a shared zero-shot user prompt: 4,000 archived ratings. The consumer rated only the 200 consumer statements; the registered dietitian rated only the 200 professional statements.",
  },
  {
    icon: Database,
    title: "The data",
    body: "The statement bank and every evaluation run are versioned public data (CC BY 4.0). Run 1 (April 2025) covers ten models. The current dataset contains one historical run. Additional runs are planned and will be versioned separately. Cite as: Aynazarov, H. (2026). Dietary Supplement Opinion Lab Dataset (v1.0). https://doi.org/10.5281/zenodo.23357963",
  },
  {
    icon: FileCheck2,
    title: "Verification",
    body: "Repository checks validate four groups of 100 statements, 4,000 complete model ratings, and agreement between the canonical data and the app bundle. Reanalysis identified historical subgroup-selection, rounding, and interpretation errors. The verification report documents corrected results and the limits of these checks.",
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
          Opinion Lab builds on Hamdam Aynazarov's 2025 master's research at Northeastern
          Illinois University, supervised by Dr. Manar Mohaisen. The platform is the author's
          subsequent independent continuation of that research.
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
