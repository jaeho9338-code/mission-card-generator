export interface Scores {
  DIR: number;
  CON: number;
  SPE: number;
  LEN: number;
  CLR: number;
  AUD: number;
  OUT: number;
  ORI: number;
  CTX: number;
  ITR: number | null;
}

export interface Highlight {
  text: string;
  type: "role" | "context" | "constraint" | "format";
}

export interface RoundResult {
  round: number;
  scores: Scores;
  overall: number;
  one_line: string;
  highlights: Highlight[];
}

export interface AnalysisResult {
  rounds: RoundResult[];
  growth_summary: string;
}
