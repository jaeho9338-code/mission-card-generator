"use client";

import { useState, useEffect, useCallback } from "react";
import { StudentData } from "@/lib/types";

const ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function InputTab() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [round, setRound] = useState<number>(1);
  const [prompt, setPrompt] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<null | {
    name: string;
    round: number;
    prompt: string;
    note: string;
  }>(null);

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/students");
    const data: StudentData[] = await res.json();
    setStudents(data);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 현재 이름 (새 학생 입력 중이면 newName 사용)
  const activeName = isAddingNew ? newName.trim() : selectedName;

  // 이 학생의 이 회차에 이미 저장된 데이터가 있는가
  const isDuplicate = () => {
    if (!activeName) return false;
    const student = students.find((s) => s.name === activeName);
    return !!student?.sessions.find((s) => s.round === round);
  };

  const doSave = async (payload: {
    name: string;
    round: number;
    prompt: string;
    note: string;
  }) => {
    setSaving(true);
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetchStudents();
    setPrompt("");
    setNote("");
    if (isAddingNew) {
      setSelectedName(payload.name);
      setIsAddingNew(false);
      setNewName("");
    }
    setSaving(false);
  };

  const handleSave = async () => {
    if (!activeName || !prompt.trim()) return;
    const payload = { name: activeName, round, prompt: prompt.trim(), note: note.trim() };

    if (isDuplicate()) {
      setPendingPayload(payload);
      setConfirmOverwrite(true);
      return;
    }
    await doSave(payload);
  };

  const handleConfirmOverwrite = async () => {
    setConfirmOverwrite(false);
    if (pendingPayload) await doSave(pendingPayload);
    setPendingPayload(null);
  };

  // 마지막 저장일 포맷
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const lastSavedAt = (student: StudentData) => {
    if (!student.sessions.length) return "—";
    const sorted = [...student.sessions].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
    return formatDate(sorted[0].savedAt);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 입력 영역 */}
      <section
        className="rounded-xl p-6 flex flex-col gap-5"
        style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
      >
        {/* 학생 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}>
            STUDENT
          </label>
          {!isAddingNew ? (
            <div className="flex gap-3">
              <select
                value={selectedName}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setIsAddingNew(true);
                    setSelectedName("");
                  } else {
                    setSelectedName(e.target.value);
                  }
                }}
                className="flex-1 rounded-lg px-4 py-3 text-sm"
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
                <option value="__new__">+ 새 학생 추가</option>
              </select>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="이름 입력"
                autoFocus
                className="flex-1 rounded-lg px-4 py-3 text-sm"
                style={{
                  background: "#1e1e1e",
                  border: "1px solid var(--accent)",
                  color: "var(--text)",
                  fontFamily: "Pretendard, sans-serif",
                  outline: "none",
                }}
              />
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewName("");
                }}
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "#1e1e1e",
                  border: "1px solid var(--border)",
                  color: "var(--subtext)",
                  cursor: "pointer",
                  fontFamily: "Pretendard, sans-serif",
                }}
              >
                취소
              </button>
            </div>
          )}
        </div>

        {/* 회차 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}>
            ROUND
          </label>
          <select
            value={round}
            onChange={(e) => setRound(Number(e.target.value))}
            className="rounded-lg px-4 py-3 text-sm w-40"
            style={{
              background: "#1e1e1e",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "Pretendard, sans-serif",
            }}
          >
            {ROUNDS.map((r) => (
              <option key={r} value={r}>
                {r}회차
              </option>
            ))}
          </select>
        </div>

        {/* 메모 (내부용) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}>
            MEMO <span style={{ opacity: 0.5 }}>(운영자 내부용, 선택)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 수업 후 제출 / 과제로 받은 것"
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: "#1e1e1e",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "Pretendard, sans-serif",
              outline: "none",
            }}
          />
        </div>

        {/* 프롬프트 입력 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}>
            PROMPT
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="학생이 작성한 프롬프트를 붙여넣으세요"
            rows={8}
            className="rounded-lg px-4 py-3 text-sm resize-y"
            style={{
              background: "#1e1e1e",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-noto-serif-kr), serif",
              lineHeight: "1.8",
              outline: "none",
            }}
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving || !activeName || !prompt.trim()}
          className="self-end px-8 py-3 rounded-lg text-sm transition-opacity"
          style={{
            background: "var(--accent)",
            color: "#f0ede6",
            fontFamily: "Pretendard, sans-serif",
            letterSpacing: "0.1em",
            cursor: saving || !activeName || !prompt.trim() ? "not-allowed" : "pointer",
            opacity: saving || !activeName || !prompt.trim() ? 0.4 : 1,
          }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </section>

      {/* 저장 현황 테이블 */}
      {students.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2
            className="text-xs"
            style={{ color: "var(--subtext)", letterSpacing: "0.1em" }}
          >
            저장 현황
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["학생 이름", "저장된 회차", "마지막 저장일"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-xs"
                    style={{
                      color: "var(--subtext)",
                      fontFamily: "Pretendard, sans-serif",
                      letterSpacing: "0.08em",
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.name}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td
                    className="py-3 px-4"
                    style={{ color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}
                  >
                    {s.name}
                  </td>
                  <td
                    className="py-3 px-4"
                    style={{ color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}
                  >
                    {s.sessions.map((se) => `${se.round}회차`).join(", ")}
                  </td>
                  <td
                    className="py-3 px-4"
                    style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}
                  >
                    {lastSavedAt(s)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 덮어쓰기 확인 다이얼로그 */}
      {confirmOverwrite && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="rounded-xl p-8 flex flex-col gap-6 max-w-sm w-full mx-4"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}
            >
              <strong style={{ color: "var(--accent)" }}>{pendingPayload?.name}</strong>의{" "}
              <strong>{pendingPayload?.round}회차</strong> 데이터가 이미 존재합니다.
              덮어쓰시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setConfirmOverwrite(false);
                  setPendingPayload(null);
                }}
                className="px-5 py-2 rounded-lg text-sm"
                style={{
                  background: "#1e1e1e",
                  border: "1px solid var(--border)",
                  color: "var(--subtext)",
                  cursor: "pointer",
                  fontFamily: "Pretendard, sans-serif",
                }}
              >
                취소
              </button>
              <button
                onClick={handleConfirmOverwrite}
                className="px-5 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--accent)",
                  color: "#f0ede6",
                  cursor: "pointer",
                  fontFamily: "Pretendard, sans-serif",
                }}
              >
                덮어쓰기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
