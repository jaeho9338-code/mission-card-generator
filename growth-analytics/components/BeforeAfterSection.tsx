"use client";

import { RoundResult, Highlight } from "@/lib/analysisTypes";

// 하이라이트 타입별 배경색
const HIGHLIGHT_COLORS: Record<Highlight["type"], string> = {
  role: "rgba(140, 47, 35, 0.35)",       // 와인레드
  context: "rgba(45, 74, 122, 0.4)",      // 네이비
  constraint: "rgba(180, 83, 9, 0.4)",    // 앰버
  format: "rgba(45, 106, 79, 0.4)",       // 초록
};

const HIGHLIGHT_LABELS: Record<Highlight["type"], string> = {
  role: "역할",
  context: "맥락",
  constraint: "제약",
  format: "형식",
};

// 원문 텍스트에 highlights 적용해 React 노드 배열로 변환
function applyHighlights(text: string, highlights: Highlight[]) {
  if (!highlights.length) return <span>{text}</span>;

  // highlights 위치를 찾아 정렬
  type Segment = { start: number; end: number; type: Highlight["type"] };
  const segments: Segment[] = [];

  for (const h of highlights) {
    const idx = text.indexOf(h.text);
    if (idx === -1) continue;
    segments.push({ start: idx, end: idx + h.text.length, type: h.type });
  }

  // 겹치는 구간 제거 후 위치순 정렬
  segments.sort((a, b) => a.start - b.start);
  const merged: Segment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (!last || seg.start >= last.end) {
      merged.push(seg);
    }
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const seg of merged) {
    if (cursor < seg.start) {
      nodes.push(<span key={`plain-${cursor}`}>{text.slice(cursor, seg.start)}</span>);
    }
    nodes.push(
      <span
        key={`hl-${seg.start}`}
        style={{
          background: HIGHLIGHT_COLORS[seg.type],
          borderRadius: 3,
          padding: "1px 2px",
        }}
      >
        {text.slice(seg.start, seg.end)}
      </span>
    );
    cursor = seg.end;
  }
  if (cursor < text.length) {
    nodes.push(<span key={`plain-end`}>{text.slice(cursor)}</span>);
  }
  return <>{nodes}</>;
}

interface PromptCardProps {
  label: string;
  round: RoundResult;
  prompt: string;
}

function PromptCard({ label, round, prompt }: PromptCardProps) {
  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="flex items-baseline gap-3">
        <p
          className="text-xs"
          style={{
            color: "var(--subtext)",
            fontFamily: "Pretendard, sans-serif",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}
        >
          overall {round.overall}
        </p>
      </div>
      <div
        className="rounded-lg p-5 leading-8 text-sm flex-1"
        style={{
          background: "#1a1a1a",
          border: "1px solid var(--border)",
          color: "var(--text)",
          fontFamily: "var(--font-noto-serif-kr), serif",
          minHeight: 140,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {applyHighlights(prompt, round.highlights)}
      </div>
    </div>
  );
}

interface Props {
  rounds: RoundResult[];
  // 원문 프롬프트 (회차 순서대로)
  prompts: { round: number; prompt: string }[];
}

export default function BeforeAfterSection({ rounds, prompts }: Props) {
  if (rounds.length === 0) return null;

  const first = rounds[0];
  const latest = rounds[rounds.length - 1];

  const getPrompt = (round: number) =>
    prompts.find((p) => p.round === round)?.prompt ?? "";

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
        BEFORE / AFTER
      </h2>

      <div className="flex gap-4">
        <PromptCard
          label={`${first.round}회차 — BEFORE`}
          round={first}
          prompt={getPrompt(first.round)}
        />
        {rounds.length > 1 && (
          <>
            <div
              className="flex items-center text-xl"
              style={{ color: "var(--subtext)" }}
            >
              →
            </div>
            <PromptCard
              label={`${latest.round}회차 — AFTER`}
              round={latest}
              prompt={getPrompt(latest.round)}
            />
          </>
        )}
      </div>

      {/* 범례 */}
      <div className="flex gap-5 flex-wrap mt-1">
        {(Object.keys(HIGHLIGHT_COLORS) as Highlight["type"][]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: HIGHLIGHT_COLORS[type] }}
            />
            <span
              className="text-xs"
              style={{
                color: "var(--subtext)",
                fontFamily: "Pretendard, sans-serif",
              }}
            >
              {HIGHLIGHT_LABELS[type]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
