import { AnalysisResult, Scores } from "./analysisTypes";

// ITR이 null이면 9개 평균, 숫자면 10개 평균
export function calcOverall(scores: Scores): number {
  const base = [
    scores.DIR, scores.CON, scores.SPE, scores.LEN, scores.CLR,
    scores.AUD, scores.OUT, scores.ORI, scores.CTX,
  ];
  const all = scores.ITR !== null ? [...base, scores.ITR] : base;
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}

// AI가 반환한 overall 대신 직접 계산값으로 교체 (수학적 일관성 보장)
export function normalizeResult(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    rounds: result.rounds.map((r) => ({
      ...r,
      overall: calcOverall(r.scores),
    })),
  };
}
