import { NextRequest, NextResponse } from "next/server";
import { listStudents, saveSession } from "@/lib/studentStore";

// GET /api/students — 전체 학생 목록 반환
export async function GET() {
  const students = listStudents();
  return NextResponse.json(students);
}

// POST /api/students — 회차 저장 (덮어쓰기 포함)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, round, prompt, note = "" } = body;

  if (!name || !round || !prompt) {
    return NextResponse.json(
      { error: "name, round, prompt 는 필수입니다." },
      { status: 400 }
    );
  }

  const data = saveSession(name, Number(round), prompt, note);
  return NextResponse.json(data);
}
