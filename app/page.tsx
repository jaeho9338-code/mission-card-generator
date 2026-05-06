"use client";

import { useState } from "react";

// 회차별 주제 — 미션 생성 맥락 표시용
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

  const isReady = studentName.trim() !== "" && interest.trim() !== "";

  return (
    <main className="min-h-screen bg-bg flex items-start justify-center px-6 py-16">
      <div className="w-full max-w-lg">

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
        <form className="space-y-7" onSubmit={(e) => e.preventDefault()}>

          {/* 회차 선택 */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">
              회차
            </label>
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
            <label className="block text-sm font-medium text-fg mb-2">
              학생 이름
            </label>
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
            <label className="block text-sm font-medium text-fg mb-2">
              관심 분야
            </label>
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

          {/* 미션 종류 — 토글 카드 */}
          <div>
            <label className="block text-sm font-medium text-fg mb-3">
              미션 종류
            </label>
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
            disabled={!isReady}
            className="w-full py-4 bg-accent text-white rounded-lg text-sm font-medium tracking-wide hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            미션 카드 생성하기
          </button>

          {!isReady && (
            <p className="text-center text-xs text-muted -mt-4">
              이름과 관심 분야를 입력하면 버튼이 활성화됩니다.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
