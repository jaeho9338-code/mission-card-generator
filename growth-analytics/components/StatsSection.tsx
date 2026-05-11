"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { RoundResult, Scores } from "@/lib/analysisTypes";

const METRIC_KEYS: (keyof Scores)[] = [
  "DIR", "CON", "SPE", "LEN", "CLR",
  "AUD", "OUT", "ORI", "CTX", "ITR",
];

const METRIC_LABELS: Record<keyof Scores, string> = {
  DIR: "디렉팅",
  CON: "제약",
  SPE: "구체성",
  LEN: "유효길이",
  CLR: "목적",
  AUD: "청중",
  OUT: "출력설계",
  ORI: "독창성",
  CTX: "맥락",
  ITR: "발전",
};

function AnimatedNumber({ target, duration = 1.0 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: "easeOut" });
    return controls.stop;
  }, [target, duration, count]);

  return <motion.span>{display}</motion.span>;
}

interface StatCardProps {
  metricKey: keyof Scores;
  latestScore: number | null;
  firstScore: number | null;
  roundScores: { round: number; score: number | null }[];
}

function StatCard({ metricKey, latestScore, firstScore, roundScores }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  const delta =
    metricKey === "ITR" || latestScore === null || firstScore === null
      ? null
      : latestScore - firstScore;

  const deltaColor =
    delta === null ? "var(--subtext)"
      : delta > 0 ? "var(--up)"
      : delta < 0 ? "var(--down)"
      : "var(--subtext)";

  const deltaSymbol =
    delta === null ? "—"
      : delta > 0 ? `+${delta} ▲`
      : delta < 0 ? `${delta} ▼`
      : "— 변화없음";

  return (
    <div
      className="relative rounded-xl p-5 flex flex-col gap-2 cursor-default transition-colors"
      style={{
        background: hovered ? "#1e1e1e" : "var(--panel)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 지표 약어 */}
      <p
        className="text-xs"
        style={{
          color: "var(--subtext)",
          fontFamily: "Pretendard, sans-serif",
          letterSpacing: "0.15em",
        }}
      >
        {metricKey}
      </p>

      {/* 최신 점수 */}
      <p
        className="font-bold"
        style={{
          fontSize: "2.2rem",
          lineHeight: 1,
          color: "var(--text)",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        {latestScore !== null ? (
          <AnimatedNumber target={latestScore} />
        ) : (
          <span style={{ color: "var(--subtext)", fontSize: "1rem" }}>—</span>
        )}
      </p>

      {/* 증감 */}
      <p
        className="text-xs font-medium"
        style={{
          color: deltaColor,
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        {deltaSymbol}
      </p>

      {/* 한글 이름 */}
      <p
        className="text-xs"
        style={{
          color: "var(--subtext)",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        {METRIC_LABELS[metricKey]}
      </p>

      {/* 호버 툴팁 — 회차별 점수 */}
      {hovered && (
        <div
          className="absolute z-10 rounded-lg p-3 flex flex-col gap-1 text-xs shadow-xl"
          style={{
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#252525",
            border: "1px solid var(--border)",
            minWidth: 120,
            whiteSpace: "nowrap",
            fontFamily: "Pretendard, sans-serif",
          }}
        >
          {roundScores.map(({ round, score }) => (
            <div key={round} className="flex justify-between gap-4">
              <span style={{ color: "var(--subtext)" }}>{round}회차</span>
              <span style={{ color: "var(--text)" }}>
                {score !== null ? score : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  rounds: RoundResult[];
}

export default function StatsSection({ rounds }: Props) {
  if (rounds.length === 0) return null;

  const first = rounds[0];
  const latest = rounds[rounds.length - 1];

  return (
    <section className="flex flex-col gap-4">
      <h2
        className="text-xs"
        style={{
          color: "var(--subtext)",
          fontFamily: "Pretendard, sans-serif",
          letterSpacing: "0.2em",
        }}
      >
        10개 지표
      </h2>

      <div className="grid grid-cols-5 gap-3">
        {METRIC_KEYS.map((key) => {
          const latestScore = latest.scores[key] as number | null;
          const firstScore = key === "ITR" ? null : (first.scores[key] as number | null);
          const roundScores = rounds.map((r) => ({
            round: r.round,
            score: r.scores[key] as number | null,
          }));

          return (
            <StatCard
              key={key}
              metricKey={key}
              latestScore={latestScore}
              firstScore={firstScore}
              roundScores={roundScores}
            />
          );
        })}
      </div>
    </section>
  );
}
