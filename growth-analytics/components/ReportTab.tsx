"use client";

import { useState, useEffect, useCallback } from "react";
import { StudentData } from "@/lib/types";
import { AnalysisResult } from "@/lib/analysisTypes";
import HeroSection from "@/components/HeroSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import StatsSection from "@/components/StatsSection";
import SummarySection from "@/components/SummarySection";
import ChartSection from "@/components/ChartSection";
import { normalizeResult } from "@/lib/utils";

export default function ReportTab() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [startRound, setStartRound] = useState<number>(1);
  const [endRound, setEndRound] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedPrompts, setAnalyzedPrompts] = useState<{ round: number; prompt: string }[]>([]);

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/students");
    const data: StudentData[] = await res.json();
    setStudents(data);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const selectedStudent = students.find((s) => s.name === selectedName);
  const availableRounds = selectedStudent
    ? selectedStudent.sessions.map((s) => s.round).sort((a, b) => a - b)
    : [];

  // 학생 바뀌면 범위 초기화
  useEffect(() => {
    if (availableRounds.length > 0) {
      setStartRound(availableRounds[0]);
      setEndRound(availableRounds[availableRounds.length - 1]);
    }
    setResult(null);
  }, [selectedName]); // eslint-disable-line react-hooks/exhaustive-deps

  // startRound가 endRound보다 크면 endRound 조정
  useEffect(() => {
    if (startRound > endRound) setEndRound(startRound);
  }, [startRound, endRound]);

  const handleAnalyze = async () => {
    if (!selectedName) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalyzedPrompts([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedName, startRound, endRound }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "분석 중 오류가 발생했습니다.");
        return;
      }
      const data: AnalysisResult = await res.json();
      setResult(normalizeResult(data)); // overall을 클라이언트에서 직접 계산해 수학적 일관성 보장

      const prompts = selectedStudent?.sessions
        .filter((s) => s.round >= startRound && s.round <= endRound)
        .map((s) => ({ round: s.round, prompt: s.prompt })) ?? [];
      setAnalyzedPrompts(prompts);
    } catch {
      setError("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = !loading && !!selectedName && availableRounds.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* 상단 입력 영역 */}
      <section
        className="rounded-xl p-6 flex flex-col gap-5"
        style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-wrap gap-4 items-end">
          {/* 학생 선택 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}>
              STUDENT
            </label>
            <select
              value={selectedName}
              onChange={(e) => { setSelectedName(e.target.value); setResult(null); }}
              className="rounded-lg px-4 py-3 text-sm w-44"
              style={{ background: "#1e1e1e", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}
            >
              <option value="">학생 선택</option>
              {students.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 시작 회차 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}>
              FROM
            </label>
            <select
              value={startRound}
              onChange={(e) => setStartRound(Number(e.target.value))}
              disabled={availableRounds.length === 0}
              className="rounded-lg px-4 py-3 text-sm w-28"
              style={{
                background: "#1e1e1e",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "Pretendard, sans-serif",
                opacity: availableRounds.length === 0 ? 0.4 : 1,
              }}
            >
              {availableRounds.map((r) => (
                <option key={r} value={r}>{r}회차</option>
              ))}
            </select>
          </div>

          {/* 화살표 */}
          <div className="pb-3" style={{ color: "var(--subtext)" }}>→</div>

          {/* 종료 회차 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}>
              TO
            </label>
            <select
              value={endRound}
              onChange={(e) => setEndRound(Number(e.target.value))}
              disabled={availableRounds.length === 0}
              className="rounded-lg px-4 py-3 text-sm w-28"
              style={{
                background: "#1e1e1e",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "Pretendard, sans-serif",
                opacity: availableRounds.length === 0 ? 0.4 : 1,
              }}
            >
              {availableRounds
                .filter((r) => r >= startRound)
                .map((r) => (
                  <option key={r} value={r}>{r}회차</option>
                ))}
            </select>
          </div>

          {/* 분석 버튼 */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="px-8 py-3 rounded-lg text-sm transition-opacity"
            style={{
              background: "var(--accent)",
              color: "#f0ede6",
              fontFamily: "Pretendard, sans-serif",
              letterSpacing: "0.1em",
              cursor: !canAnalyze ? "not-allowed" : "pointer",
              opacity: !canAnalyze ? 0.4 : 1,
            }}
          >
            {loading ? "분석 중..." : "분석 시작"}
          </button>
        </div>

        {students.length === 0 && (
          <p className="text-sm" style={{ color: "var(--subtext)" }}>
            INPUT 탭에서 학생 데이터를 먼저 저장하세요.
          </p>
        )}
      </section>

      {/* 에러 */}
      {error && (
        <p
          className="text-sm px-4 py-3 rounded-lg"
          style={{ background: "#2a1a1a", color: "var(--down)", border: "1px solid var(--down)", fontFamily: "Pretendard, sans-serif" }}
        >
          {error}
        </p>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
          <p className="text-sm" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
            AI가 프롬프트를 분석하고 있습니다...
          </p>
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className="flex flex-col gap-8">
          {/* 구역 1 — 히어로 */}
          <HeroSection rounds={result.rounds} />
          {/* 구역 2 — 그래프 */}
          <ChartSection rounds={result.rounds} />
          {/* 구역 3 — 비포/애프터 */}
          <BeforeAfterSection rounds={result.rounds} prompts={analyzedPrompts} />
          {/* 구역 4 — 스탯 카드 */}
          <StatsSection rounds={result.rounds} />
          {/* 구역 5 — AI 총평 */}
          <SummarySection summary={result.growth_summary} />
        </div>
      )}
    </div>
  );
}
