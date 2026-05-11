"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { RoundResult } from "@/lib/analysisTypes";

interface Props {
  rounds: RoundResult[];
}

// 숫자 카운터 훅
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

  const growthRate =
    firstScore === 0
      ? null
      : Math.round(((latestScore - firstScore) / firstScore) * 100);

  const isGrowth = growthRate !== null && growthRate >= 0;

  return (
    <section
      className="rounded-xl p-8"
      style={{
        background: "var(--panel)",
        border: "2px solid var(--accent)",
      }}
    >
      {/* 제목 */}
      <p
        className="text-xs mb-8"
        style={{
          color: "var(--subtext)",
          fontFamily: "Pretendard, sans-serif",
          letterSpacing: "0.2em",
        }}
      >
        AI 디렉팅 역량 지수
      </p>

      {/* 메인 영역 */}
      <div className="flex items-center gap-6">
        {/* 1회차 */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <p
            className="text-xs"
            style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif", letterSpacing: "0.12em" }}
          >
            {first.round}회차
          </p>
          <p
            className="font-bold"
            style={{
              fontSize: "4rem",
              lineHeight: 1,
              color: "var(--text)",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            <AnimatedNumber target={firstScore} />
          </p>
          {/* progress bar */}
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 6, background: "var(--border)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${firstScore}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ height: "100%", background: "var(--subtext)", borderRadius: 9999 }}
            />
          </div>
        </div>

        {/* 중앙 — 증감률 */}
        <div className="flex flex-col items-center gap-2 px-4">
          <span style={{ color: "var(--subtext)", fontSize: "1.2rem" }}>→</span>
          {growthRate !== null && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="font-bold text-xl"
              style={{
                fontFamily: "Pretendard, sans-serif",
                color: isGrowth ? "var(--up)" : "var(--down)",
                whiteSpace: "nowrap",
              }}
            >
              {isGrowth ? "+" : ""}
              {growthRate}%
            </motion.p>
          )}
          {rounds.length === 1 && (
            <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
              1회차만
            </p>
          )}
        </div>

        {/* 최신 회차 */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <p
            className="text-xs"
            style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif", letterSpacing: "0.12em" }}
          >
            {latest.round}회차
          </p>
          <p
            className="font-bold"
            style={{
              fontSize: "4rem",
              lineHeight: 1,
              color: isGrowth ? "var(--up)" : latestScore < firstScore ? "var(--down)" : "var(--text)",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            <AnimatedNumber target={latestScore} />
          </p>
          {/* progress bar */}
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 6, background: "var(--border)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${latestScore}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              style={{
                height: "100%",
                background: isGrowth ? "var(--up)" : latestScore < firstScore ? "var(--down)" : "var(--accent)",
                borderRadius: 9999,
              }}
            />
          </div>
        </div>
      </div>

      {/* one_line 요약 */}
      {rounds.length > 1 && (
        <div className="mt-6 flex gap-4 text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
          <span>
            1회차: <span style={{ color: "var(--text)" }}>{first.one_line}</span>
          </span>
          <span>→</span>
          <span>
            {latest.round}회차: <span style={{ color: "var(--text)" }}>{latest.one_line}</span>
          </span>
        </div>
      )}
    </section>
  );
}
