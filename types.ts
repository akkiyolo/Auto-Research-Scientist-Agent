
export interface ComparisonRow {
  aspect: string;
  [paperKey: string]: string;
}

export interface ResearchResult {
  researchBrief: string;
  comparisonTable: ComparisonRow[];
  paperKeys: string[];
  notebookCode: string;
}
