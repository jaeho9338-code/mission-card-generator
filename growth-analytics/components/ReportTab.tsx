"use client";

import { useState, useEffect, useCallback } from "react";
import { StudentData } from "@/lib/types";
import { AnalysisResult } from "@/lib/analysisTypes";
import HeroSection from "@/components/HeroSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import StatsSection from "@/components/StatsSection";

export default function ReportTab() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [maxRound, setMaxRound] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  // 분석에 사용된 원문 프롬프트 (비포/애프터 구역용)
  const [analyzedPrompts, setAnalyzedPrompts] = useState<{ round: number; prompt: string }[]>([]);

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/students");
    const data: StudentData[] = await res.json();
    setStudents(data);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 선택된 학생의 최대 회차
  const selectedStudent = students.find((s) => s.name === selectedName);
  const availableRounds = selectedStudent
    ? selectedStudent.sessions.map((s) => s.round).sort((a, b) => a - b)
    : [];

  useEffect(() => {
    if (availableRounds.length > 0) {
      setMaxRound(availableRounds[availableRounds.length - 1]);
    }
  }, [selectedName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnalyze = async () => {
    if (!selectedName || !maxRound) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalyzedPrompts([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedName, maxRound }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "분석 중 오류가 발생했습니다.");
        return;
      }
      const data: AnalysisResult = await res.json();
      setResult(data);
      // 원문 프롬프트 저장 (비포/애프터 구역용)
      const prompts = selectedStudent?.sessions
        .filter((s) => s.round <= maxRound)
        .map((s) => ({ round: s.round, prompt: s.prompt })) ?? [];
      setAnalyzedPrompts(prompts);
    } catch {
      setError("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

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
            <label
              className="text-xs"
              style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}
            >
              STUDENT
            </label>
            <select
              value={selectedName}
              onChange={(e) => {
                setSelectedName(e.target.value);
                setResult(null);
              }}
              className="rounded-lg px-4 py-3 text-sm w-48"
              style={{
                background: "#1e1e1e",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "Pretendard, sans-serif",
              }}
            >
              <option value="">학생 선택</option>
              {students.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 회차 선택 */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs"
              style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}
            >
              까지 분석
            </label>
            <select
              value={maxRound}
              onChange={(e) => setMaxRound(Number(e.target.value))}
              disabled={availableRounds.length === 0}
              className="rounded-lg px-4 py-3 text-sm w-32"
              style={{
                background: "#1e1e1e",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "Pretendard, sans-serif",
                opacity: availableRounds.length === 0 ? 0.4 : 1,
              }}
            >
              {availableRounds.map((r) => (
                <option key={r} value={r}>
                  {r}회차
                </option>
              ))}
            </select>
          </div>

          {/* 분석 버튼 */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !selectedName || availableRounds.length === 0}
            className="px-8 py-3 rounded-lg text-sm transition-opacity"
            style={{
              background: "var(--accent)",
              color: "#f0ede6",
              fontFamily: "Pretendard, sans-serif",
              letterSpacing: "0.1em",
              cursor:
                loading || !selectedName || availableRounds.length === 0
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading || !selectedName || availableRounds.length === 0 ? 0.4 : 1,
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
        <p className="text-sm px-4 py-3 rounded-lg" style={{ background: "#2a1a1a", color: "var(--down)", border: "1px solid var(--down)", fontFamily: "Pretendard, sans-serif" }}>
          {error}
        </p>
      )}

      {/* 분석 중 로딩 */}
      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--accent)" }}
          />
          <p className="text-sm" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
            AI가 프롬프트를 분석하고 있습니다...
          </p>
        </div>
      )}

      {/* 결과 — 4단계~7단계에서 구역별로 채워집니다 */}
      {result && (
        <div className="flex flex-col gap-6">
          <p className="text-xs px-3 py-2 rounded" style={{ color: "var(--subtext)", background: "var(--panel)", fontFamily: "Pretendard, sans-serif", border: "1px solid var(--border)" }}>
            분석 완료 — {result.rounds.length}개 회차 ({result.rounds.map(r => `${r.round}회차`).join(", ")})
          </p>
          {/* 구역 1 — 히어로 */}
          <HeroSection rounds={result.rounds} />
          {/* 구역 2 — 비포/애프터 */}
          <BeforeAfterSection rounds={result.rounds} prompts={analyzedPrompts} />
          {/* 구역 3 — 스탯 카드 */}
          <StatsSection rounds={result.rounds} />
          {/* 7단계 구역이 여기 추가됩니다 */}
        </div>
      )}
    </div>
  );
}
