"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import { RoundResult, Scores } from "@/lib/analysisTypes";

// ITR 제외한 9개 지표만 레이더에 사용
const RADAR_KEYS: (keyof Omit<Scores, "ITR">)[] = [
  "DIR", "CON", "SPE", "LEN", "CLR", "AUD", "OUT", "ORI", "CTX",
];

const METRIC_LABELS: Record<string, string> = {
  DIR: "디렉팅",
  CON: "제약",
  SPE: "구체성",
  LEN: "유효길이",
  CLR: "목적",
  AUD: "청중",
  OUT: "출력설계",
  ORI: "독창성",
  CTX: "맥락",
};

interface Props {
  rounds: RoundResult[];
}

// recharts 커스텀 툴팁
function LineTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: "#252525",
        border: "1px solid var(--border)",
        fontFamily: "Pretendard, sans-serif",
        color: "var(--text)",
      }}
    >
      <p style={{ color: "var(--subtext)" }}>{label}</p>
      <p style={{ color: "var(--accent)" }}>overall {payload[0].value}</p>
    </div>
  );
}

export default function ChartSection({ rounds }: Props) {
  if (rounds.length < 2) return null;

  const first = rounds[0];
  const latest = rounds[rounds.length - 1];

  // 라인차트 데이터
  const lineData = rounds.map((r) => ({
    name: `${r.round}회차`,
    overall: r.overall,
  }));

  // 레이더차트 데이터
  const radarData = RADAR_KEYS.map((key) => ({
    metric: METRIC_LABELS[key],
    start: (first.scores[key] as number) ?? 0,
    end: (latest.scores[key] as number) ?? 0,
  }));

  return (
    <section className="flex flex-col gap-4">
      <h2
        className="text-xs"
        style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif", letterSpacing: "0.2em" }}
      >
        CHART
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* 라인차트 — 회차별 overall 추이 */}
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
            Overall 점수 추이
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#8a8270", fontSize: 11, fontFamily: "Pretendard, sans-serif" }}
                axisLine={{ stroke: "#2a2a2a" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#8a8270", fontSize: 11, fontFamily: "Pretendard, sans-serif" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="overall"
                stroke="#8c2f23"
                strokeWidth={2}
                dot={{ fill: "#8c2f23", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#f0ede6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 레이더차트 — 시작 vs 끝 비교 */}
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
            {first.round}회차 vs {latest.round}회차 — 9개 지표
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
              <PolarGrid stroke="#2a2a2a" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#8a8270", fontSize: 10, fontFamily: "Pretendard, sans-serif" }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name={`${first.round}회차`}
                dataKey="start"
                stroke="#4a4a4a"
                fill="#4a4a4a"
                fillOpacity={0.25}
              />
              <Radar
                name={`${latest.round}회차`}
                dataKey="end"
                stroke="#8c2f23"
                fill="#8c2f23"
                fillOpacity={0.3}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  fontFamily: "Pretendard, sans-serif",
                  color: "#8a8270",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
