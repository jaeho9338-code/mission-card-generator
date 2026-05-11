"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StudentData } from "@/lib/types";

const ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface ConfirmState {
  show: boolean;
  message: string;
  onConfirm: () => void;
}

export default function InputTab() {
  const [students, setStudents] = useState<StudentData[]>([]);

  // 폼 상태
  const [selectedName, setSelectedName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [round, setRound] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // 확인 다이얼로그
  const [confirm, setConfirm] = useState<ConfirmState>({ show: false, message: "", onConfirm: () => {} });

  // 이름 변경 인라인
  const [renamingName, setRenamingName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/students");
    setStudents(await res.json());
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const activeName = isAddingNew ? newName.trim() : selectedName;

  const isDuplicate = () => {
    if (!activeName) return false;
    const s = students.find((s) => s.name === activeName);
    return !!s?.sessions.find((se) => se.round === round);
  };

  const doSave = async (name: string, r: number, p: string, n: string) => {
    setSaving(true);
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, round: r, prompt: p, note: n }),
    });
    await fetchStudents();
    setPrompt("");
    setNote("");
    if (isAddingNew) {
      setSelectedName(name);
      setIsAddingNew(false);
      setNewName("");
    }
    setSaving(false);
  };

  const handleSave = () => {
    if (!activeName || !prompt.trim()) return;
    const p = prompt.trim();
    const n = note.trim();
    if (isDuplicate()) {
      setConfirm({
        show: true,
        message: `${activeName}의 ${round}회차 데이터가 이미 존재합니다. 덮어쓰시겠습니까?`,
        onConfirm: () => doSave(activeName, round, p, n),
      });
    } else {
      doSave(activeName, round, p, n);
    }
  };

  // 수정 버튼: 해당 회차 데이터를 폼에 로드
  const handleEditRound = (name: string, r: number) => {
    const student = students.find((s) => s.name === name);
    const session = student?.sessions.find((se) => se.round === r);
    if (!session) return;
    setIsAddingNew(false);
    setSelectedName(name);
    setRound(r);
    setPrompt(session.prompt);
    setNote(session.note ?? "");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 회차 삭제
  const handleDeleteRound = (name: string, r: number) => {
    setConfirm({
      show: true,
      message: `${name}의 ${r}회차 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      onConfirm: async () => {
        await fetch(`/api/students?name=${encodeURIComponent(name)}&round=${r}`, { method: "DELETE" });
        await fetchStudents();
      },
    });
  };

  // 학생 전체 삭제
  const handleDeleteStudent = (name: string) => {
    setConfirm({
      show: true,
      message: `${name}의 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      onConfirm: async () => {
        await fetch(`/api/students?name=${encodeURIComponent(name)}`, { method: "DELETE" });
        if (selectedName === name) setSelectedName("");
        await fetchStudents();
      },
    });
  };

  // 이름 변경
  const handleRenameConfirm = async (oldName: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === oldName) { setRenamingName(null); return; }
    const res = await fetch("/api/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: oldName, newName: trimmed }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }
    if (selectedName === oldName) setSelectedName(trimmed);
    setRenamingName(null);
    await fetchStudents();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const lastSavedAt = (student: StudentData) => {
    if (!student.sessions.length) return "—";
    const sorted = [...student.sessions].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    return formatDate(sorted[0].savedAt);
  };

  const inputStyle = {
    background: "#1e1e1e",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontFamily: "Pretendard, sans-serif",
    outline: "none",
  };

  const labelStyle = {
    color: "var(--subtext)",
    fontFamily: "Pretendard, sans-serif",
    letterSpacing: "0.1em",
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── 입력 폼 ── */}
      <section
        ref={formRef}
        className="rounded-xl p-6 flex flex-col gap-5"
        style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
      >
        {/* 학생 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={labelStyle}>STUDENT</label>
          {!isAddingNew ? (
            <select
              value={selectedName}
              onChange={(e) => {
                if (e.target.value === "__new__") { setIsAddingNew(true); setSelectedName(""); }
                else setSelectedName(e.target.value);
              }}
              className="rounded-lg px-4 py-3 text-sm w-56"
              style={inputStyle}
            >
              <option value="">학생 선택</option>
              {students.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              <option value="__new__">+ 새 학생 추가</option>
            </select>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="이름 입력"
                autoFocus
                className="rounded-lg px-4 py-3 text-sm w-56"
                style={{ ...inputStyle, border: "1px solid var(--accent)" }}
              />
              <button onClick={() => { setIsAddingNew(false); setNewName(""); }}
                className="px-4 py-3 rounded-lg text-sm"
                style={{ ...inputStyle, color: "var(--subtext)", cursor: "pointer" }}>
                취소
              </button>
            </div>
          )}
        </div>

        {/* 회차 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={labelStyle}>ROUND</label>
          <select value={round} onChange={(e) => setRound(Number(e.target.value))}
            className="rounded-lg px-4 py-3 text-sm w-32" style={inputStyle}>
            {ROUNDS.map((r) => <option key={r} value={r}>{r}회차</option>)}
          </select>
        </div>

        {/* 메모 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={labelStyle}>
            MEMO <span style={{ opacity: 0.5 }}>(운영자 내부용, 선택)</span>
          </label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="예: 수업 후 제출 / 과제로 받은 것"
            className="rounded-lg px-4 py-3 text-sm" style={inputStyle} />
        </div>

        {/* 프롬프트 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={labelStyle}>PROMPT</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="학생이 작성한 프롬프트를 붙여넣으세요"
            rows={8} className="rounded-lg px-4 py-3 text-sm resize-y"
            style={{ ...inputStyle, fontFamily: "var(--font-noto-serif-kr), serif", lineHeight: "1.8" }} />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saving || !activeName || !prompt.trim()}
          className="self-end px-8 py-3 rounded-lg text-sm"
          style={{
            background: "var(--accent)", color: "#f0ede6",
            fontFamily: "Pretendard, sans-serif", letterSpacing: "0.1em",
            cursor: saving || !activeName || !prompt.trim() ? "not-allowed" : "pointer",
            opacity: saving || !activeName || !prompt.trim() ? 0.4 : 1,
          }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </section>

      {/* ── 데이터 관리 ── */}
      {students.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs" style={labelStyle}>데이터 관리</h2>

          <div className="flex flex-col gap-3">
            {students.map((student) => (
              <div
                key={student.name}
                className="rounded-xl p-5 flex flex-col gap-4"
                style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
              >
                {/* 학생 헤더 */}
                <div className="flex items-center justify-between">
                  {renamingName === student.name ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameConfirm(student.name);
                          if (e.key === "Escape") setRenamingName(null);
                        }}
                        autoFocus
                        className="rounded-lg px-3 py-1.5 text-sm"
                        style={{ ...inputStyle, border: "1px solid var(--accent)", width: 140 }}
                      />
                      <button onClick={() => handleRenameConfirm(student.name)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: "var(--accent)", color: "#f0ede6", cursor: "pointer", fontFamily: "Pretendard, sans-serif" }}>
                        확인
                      </button>
                      <button onClick={() => setRenamingName(null)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ ...inputStyle, color: "var(--subtext)", cursor: "pointer" }}>
                        취소
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium text-sm" style={{ color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}>
                      {student.name}
                    </p>
                  )}

                  {renamingName !== student.name && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
                        마지막 저장: {lastSavedAt(student)}
                      </span>
                      <button
                        onClick={() => { setRenamingName(student.name); setRenameValue(student.name); }}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: "#1e1e1e", border: "1px solid var(--border)", color: "var(--subtext)", cursor: "pointer", fontFamily: "Pretendard, sans-serif" }}
                      >
                        이름 변경
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.name)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--down)", cursor: "pointer", fontFamily: "Pretendard, sans-serif" }}
                      >
                        학생 삭제
                      </button>
                    </div>
                  )}
                </div>

                {/* 회차 목록 */}
                {student.sessions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.sessions.map((session) => (
                      <div
                        key={session.round}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5"
                        style={{ background: "#1e1e1e", border: "1px solid var(--border)" }}
                      >
                        <span className="text-xs" style={{ color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}>
                          {session.round}회차
                        </span>
                        <button
                          onClick={() => handleEditRound(student.name, session.round)}
                          className="text-xs ml-1"
                          style={{ color: "var(--accent)", fontFamily: "Pretendard, sans-serif", cursor: "pointer", background: "none", border: "none" }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteRound(student.name, session.round)}
                          className="text-xs ml-0.5"
                          style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif", cursor: "pointer", background: "none", border: "none" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "var(--subtext)", fontFamily: "Pretendard, sans-serif" }}>
                    저장된 회차 없음
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 확인 다이얼로그 */}
      {confirm.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-xl p-8 flex flex-col gap-6 max-w-sm w-full mx-4"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)", fontFamily: "Pretendard, sans-serif" }}>
              {confirm.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm({ show: false, message: "", onConfirm: () => {} })}
                className="px-5 py-2 rounded-lg text-sm"
                style={{ background: "#1e1e1e", border: "1px solid var(--border)", color: "var(--subtext)", cursor: "pointer", fontFamily: "Pretendard, sans-serif" }}>
                취소
              </button>
              <button
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm({ show: false, message: "", onConfirm: () => {} });
                }}
                className="px-5 py-2 rounded-lg text-sm"
                style={{ background: "var(--accent)", color: "#f0ede6", cursor: "pointer", fontFamily: "Pretendard, sans-serif" }}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
