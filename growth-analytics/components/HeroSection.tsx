"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { RoundResult } from "@/lib/analysisTypes";

interface Props {
  rounds: RoundResult[];
}

function AnimatedNumber({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(count, target, { duration, ease: "easeOut" });
    return controls.stop;
  }, [target, duration, count]);
  return <motion.span>{display}</motion.span>;
}

export default function HeroSection({ rounds }: Props) {
  if (rounds.length === 0) return null;

  const first = rounds[0];
  const latest = rounds[rounds.length - 1];
  const firstScore = first.overall;
  const latestScore = latest.overall;
  const delta = latestScore - firstScore;

  const isRegression = rounds.length > 1 && delta < 0;
  const isFlat = rounds.length > 1 && delta === 0;
  const isGrowth = rounds.length > 1 && delta > 0;

  const growthRate =
    rounds.length === 1 ? null
    : firstScore === 0 ? null
    : Math.round((delta / firstScore) * 100);

  const latestColor = isRegression ? "var(--down)" : isGrowth ? "var(--up)" : "var(--text)";
  const deltaColor = isRegression ? "var(--down)" : isGrowth ? "var(--up)" : "var(--subtext)";

  // 지표 이름 나열 (수식 표시용)
  const metricNames = first.scores.ITR === null
    ? "DIR · CON · SPE · LEN · CLR · AUD · OUT · ORI · CTX"
    : "DIR · CON · SPE · LEN · CLR · AUD · OUT · ORI · CTX · ITR";

  return (
    <section
      className="rounded-xl p-8"
      style={{
        background: "var(--panel)",
        border: `2px solid ${isRegression ? "var(--down)" : "var(--accent)"}`,
      }}
    >
      {/* 제목 + 퇴보 뱃지 */}
      <div className="flex items-center gap-3 mb-8">
        <p
          className="text-xs"
          style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif", letterSpacing: "0.2em" }}
        >
          AI 디렉팅 역량 지수
        </p>
        {isRegression && (
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: "rgba(239,68,68,0.15)", color: "var(--down)", fontFamily: "Pretendard, sans-serif", letterSpacing: "0.05em" }}
          >
            퇴보 구간 포함
          </span>
        )}
      </div>

      {/* 메인 점수 영역 */}
      <div className="flex items-center gap-6">
        {/* 시작 회차 */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
            {first.round}회차
          </p>
          <p className="font-bold" style={{ fontSize: "4rem", lineHeight: 1, color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}>
            <AnimatedNumber target={firstScore} />
          </p>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${firstScore}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ height: "100%", background: "var(--subtext)", borderRadius: 9999 }}
            />
          </div>
        </div>

        {/* 중앙 — 증감률 */}
        <div className="flex flex-col items-center gap-2 px-4 min-w-16">
          <span style={{ color: "var(--subtext)", fontSize: "1.2rem" }}>→</span>
          {growthRate !== null && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="font-bold text-xl text-center"
              style={{ fontFamily: "Pretendard, sans-serif", color: deltaColor, whiteSpace: "nowrap" }}
            >
              {isGrowth ? "+" : ""}{growthRate}%
            </motion.p>
          )}
          {isFlat && (
            <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
              변화없음
            </p>
          )}
          {rounds.length === 1 && (
            <p className="text-xs text-center" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
              1회차만
            </p>
          )}
        </div>

        {/* 종료 회차 */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
            {latest.round}회차
          </p>
          <p className="font-bold" style={{ fontSize: "4rem", lineHeight: 1, color: latestColor, fontFamily: "Pretendard, sans-serif" }}>
            <AnimatedNumber target={latestScore} />
          </p>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${latestScore}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              style={{
                height: "100%",
                background: isRegression ? "var(--down)" : isGrowth ? "var(--up)" : "var(--subtext)",
                borderRadius: 9999,
              }}
            />
          </div>
        </div>
      </div>

      {/* 수식 연결 표시 */}
      <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif", letterSpacing: "0.05em" }}>
          종합 점수 = ( {metricNames} ) 의 평균 &nbsp;—&nbsp; 아래 10개 지표 카드에서 직접 확인하세요
        </p>
      </div>

      {/* 한 줄 평 */}
      {rounds.length > 1 && (
        <div className="mt-3 flex gap-4 text-xs flex-wrap" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
          <span>{first.round}회차: <span style={{ color: "var(--text)" }}>{first.one_line}</span></span>
          <span>→</span>
          <span>{latest.round}회차: <span style={{ color: latestColor }}>{latest.one_line}</span></span>
        </div>
      )}
    </section>
  );
}
