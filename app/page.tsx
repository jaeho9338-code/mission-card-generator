"use client";

import { useState, FormEvent } from "react";
import type { MissionCard } from "./api/generate-mission/route";

// 회차별 주제 — 드롭다운 표시용
const SESSION_TOPICS: Record<number, string> = {
  1: "처음 만남 — 왜 AI인가",
  2: "AI에게 시키는 법",
  3: "글과 발표 자료",
  4: "전문가의 톤으로 글쓰기",
  5: "이미지 시리즈",
  6: "음성과 영상",
  7: "PC 웹 도구 만들기",
  8: "다듬기와 가려내기",
  9: "부모님께 발표",
};

export default function Home() {
  const [session, setSession] = useState<number>(1);
  const [studentName, setStudentName] = useState("");
  const [interest, setInterest] = useState("");
  const [missionType, setMissionType] = useState<"현장" | "과제">("현장");

  const [result, setResult] = useState<MissionCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = studentName.trim() !== "" && interest.trim() !== "";

  async function handleDownload() {
    if (!result) return;
    setIsDownloading(true);
    try {
      const res = await fetch("/api/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error("PDF 생성 실패");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `미션카드_${result.sessionNumber}회차_${result.studentName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionNumber: session,
          studentName,
          interest,
          missionType,
        }),
      });

      if (!res.ok) throw new Error("서버 오류");
      const data: MissionCard = await res.json();
      setResult(data);
    } catch {
      setError("미션 생성 중 오류가 발생했습니다. API 키와 네트워크를 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-16">
      <div className="w-full max-w-lg mx-auto">

        {/* 헤더 */}
        <header className="mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase mb-4">
            Mission Card Generator
          </p>
          <h1 className="font-serif text-[2rem] font-bold text-fg leading-snug">
            미션 카드 생성기
          </h1>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            회차와 학생 정보를 입력하면 관심 분야에 맞춘 미션 카드를 만들어 드립니다.
          </p>
        </header>

        {/* 입력 폼 */}
        <form className="space-y-7" onSubmit={handleSubmit}>

          {/* 회차 선택 */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">회차</label>
            <select
              value={session}
              onChange={(e) => setSession(Number(e.target.value))}
              className="w-full border border-border rounded-lg px-4 py-3 text-fg bg-bg text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {Object.entries(SESSION_TOPICS).map(([num, topic]) => (
                <option key={num} value={num}>
                  {num}회차 — {topic}
                </option>
              ))}
            </select>
          </div>

          {/* 학생 이름 */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">학생 이름</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="예: 김민준"
              className="w-full border border-border rounded-lg px-4 py-3 text-fg text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* 관심 분야 */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">관심 분야</label>
            <input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="예: 축구, 게임, K-pop, 과학, 역사..."
              className="w-full border border-border rounded-lg px-4 py-3 text-fg text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <p className="mt-2 text-xs text-muted">
              같은 회차라도 이 분야에 맞게 의뢰인·상황·산출물이 달라집니다.
            </p>
          </div>

          {/* 미션 종류 토글 */}
          <div>
            <label className="block text-sm font-medium text-fg mb-3">미션 종류</label>
            <div className="grid grid-cols-2 gap-3">
              {(["현장", "과제"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMissionType(type)}
                  className={`py-3.5 rounded-lg border text-sm font-medium transition-colors ${
                    missionType === type
                      ? "border-accent bg-accent-light text-accent-dark"
                      : "border-border text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {type === "현장" ? "현장 미션" : "과제 미션"}
                  <span className="block text-xs font-normal mt-0.5 opacity-60">
                    {type === "현장" ? "수업 중 제작" : "수업 후 제출"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-1" />

          {/* 생성 버튼 */}
          <button
            type="submit"
            disabled={!isReady || isLoading}
            className="w-full py-4 bg-accent text-white rounded-lg text-sm font-medium tracking-wide hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "미션 생성 중..." : "미션 카드 생성하기"}
          </button>

          {!isReady && !isLoading && (
            <p className="text-center text-xs text-muted -mt-4">
              이름과 관심 분야를 입력하면 버튼이 활성화됩니다.
            </p>
          )}
        </form>

        {/* 오류 메시지 */}
        {error && (
          <div className="mt-8 p-4 border border-red-200 rounded-lg bg-red-50 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 생성 결과 미리보기 */}
        {result && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg font-bold text-fg">생성된 미션 카드</h2>
              <button
                onClick={() => setResult(null)}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                닫기
              </button>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              {/* 카드 헤더 */}
              <div className="bg-accent px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-medium tracking-widest uppercase">
                    {result.missionType} 미션
                  </span>
                  <span className="text-white text-xs opacity-80">
                    MISSION-0{result.sessionNumber}
                  </span>
                </div>
                <p className="text-white font-serif text-lg font-bold mt-1">
                  {result.sessionNumber}회차 — {result.sessionTopic}
                </p>
                <p className="text-white text-xs opacity-70 mt-0.5">
                  {result.studentName} · 기르는 능력: {result.skills}
                </p>
              </div>

              {/* 카드 본문 */}
              <div className="divide-y divide-border">
                <CardRow label="의뢰인" value={result.client} />
                <CardRow label="상황" value={result.situation} />
                <CardRow label="최종 산출물" value={result.deliverable} />
                <div className="px-6 py-4">
                  <p className="text-xs text-muted mb-2">제약</p>
                  <ul className="space-y-1">
                    {result.constraints.map((c, i) => (
                      <li key={i} className="text-sm text-fg flex gap-2">
                        <span className="text-accent">—</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <CardRow label="성공 기준" value={result.successCriteria} />
                <CardRow label="심사관" value={result.judge} />
              </div>
            </div>

                    <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="mt-5 w-full py-4 border border-accent text-accent rounded-lg text-sm font-medium tracking-wide hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDownloading ? "PDF 생성 중..." : "PDF 다운로드"}
            </button>
          </section>
        )}

      </div>
    </main>
  );
}

// 카드 행 컴포넌트
function CardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm text-fg leading-relaxed">{value}</p>
    </div>
  );
}
