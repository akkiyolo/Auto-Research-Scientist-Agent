export interface ComparisonMetric {
  paper: string;
  methodology: string;
  dataset: string;
  keyFinding: string;
  [key: string]: string;
}

export interface ResearchResult {
  researchBrief: string;
  comparisonTable: ComparisonMetric[];
  notebookCode: string;
}
