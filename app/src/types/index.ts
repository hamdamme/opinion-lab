export interface LLMMeta {
  name: string;
  region?: string;
  provider?: string;
  model?: string;
  params?: string;
  context?: string;
  architecture?: string;
  license?: string;
  access?: string;
  instruction?: string;
}

export interface Statement {
  id: string;
  statement: string;
  source: string;
  topic: string;
  audience: "Consumer" | "Professional";
  bias: "Positive" | "Negative";
  reference: number; // study reference-rater answer (1-5)
  ratings: Record<string, number>; // llm name -> 1-5
}

export interface Dataset {
  statements: Statement[];
  llms: LLMMeta[];
}

export type ReferenceMode = "study" | "me";

export interface LLMStats {
  name: string;
  n: number;
  exact: number; // exact-match fraction
  within1: number; // |diff| <= 1 fraction
  mae: number; // mean absolute error
  bias: number; // mean signed error (positive = over-rates vs reference)
  over: number; // fraction rated higher than reference
  under: number; // fraction rated lower than reference
}

export const LIKERT_LABELS: Record<number, string> = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree",
};
