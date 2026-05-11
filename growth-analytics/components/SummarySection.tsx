"use client";

interface Props {
  summary: string;
}

export default function SummarySection({ summary }: Props) {
  return (
    <section
      className="rounded-xl p-8 flex flex-col gap-6"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
      }}
    >
      {/* 큰따옴표 + 총평 */}
      <div className="flex flex-col gap-4">
        <span
          style={{
            color: "var(--accent)",
            fontSize: "3rem",
            lineHeight: 0.8,
            fontFamily: "var(--font-noto-serif-kr), serif",
          }}
        >
          "
        </span>
        <p
          className="text-center leading-10"
          style={{
            fontFamily: "var(--font-noto-serif-kr), serif",
            fontSize: "1.15rem",
            color: "var(--text)",
            whiteSpace: "pre-wrap",
          }}
        >
          {summary}
        </p>
        <span
          className="self-end"
          style={{
            color: "var(--accent)",
            fontSize: "3rem",
            lineHeight: 0.8,
            fontFamily: "var(--font-noto-serif-kr), serif",
          }}
        >
          "
        </span>
      </div>

      {/* 면책 문구 */}
      <p
        className="text-xs text-center leading-6"
        style={{
          color: "var(--subtext)",
          fontFamily: "Pretendard, sans-serif",
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem",
        }}
      >
        ※ 이 분석은 AI의 느슨한 평가 기준에 의한 것으로,
        절대적 수치가 아닌 성장 흐름의 참고용입니다.
      </p>
    </section>
  );
}
