import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    title: "Statement curation",
    body: "400 Likert-scale statements about dietary supplements were curated from NIH Office of Dietary Supplements fact sheets and peer-reviewed literature. Half are written for consumers, half for health professionals; within each audience, half are positively biased (favoring supplements) and half negatively biased.",
  },
  {
    title: "Source-grounded rating",
    body: "Every statement is paired with its evidence source — an ODS fact sheet or a PubMed Central article. Both the human reference rater and the LLMs were expected to ground their agreement rating (1 = Strongly Disagree … 5 = Strongly Agree) in that source.",
  },
  {
    title: "Frontier LLM evaluation",
    body: "Ten frontier LLMs from OpenAI, Anthropic, Google, Meta, DeepSeek, Mistral, TII and LG AI Research each rated all 400 statements under a controlled prompt. Their ratings were compared to the human reference rater on exact agreement, ±1 agreement, mean absolute error and tendency bias.",
  },
  {
    title: "This application",
    body: "Opinion Lab turns the study dataset into an interactive instrument: rate statements yourself after reading the source, then measure how each LLM deviates from you and from the study rater. A live-compare mode lets you query any OpenAI-compatible model on the same statements.",
  },
];

export function Methodology() {
  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-muted-foreground">
        Based on the master's project <em>“Evaluation of Large Language Model Tendencies in the
        Context of Dietary Supplements”</em> (CS-490, Northeastern Illinois University) by Hamdam
        Aynazarov, advised by Dr. Manar Mohaisen.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                <span className="text-muted-foreground mr-2">{i + 1}.</span>
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{s.body}</CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Disclaimer: this tool is for research and education. It does not provide medical or
        nutritional advice.
      </p>
    </div>
  );
}
