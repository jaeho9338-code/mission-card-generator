import { NextRequest, NextResponse } from "next/server";
import {
  listStudents,
  saveSession,
  deleteSession,
  deleteStudent,
  renameStudent,
} from "@/lib/studentStore";

export async function GET() {
  const students = listStudents();
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const { name, round, prompt, note = "" } = await req.json();
  if (!name || !round || !prompt) {
    return NextResponse.json({ error: "name, round, prompt 는 필수입니다." }, { status: 400 });
  }
  const data = saveSession(name, Number(round), prompt, note);
  return NextResponse.json(data);
}

// 학생 이름 변경
export async function PATCH(req: NextRequest) {
  const { name, newName } = await req.json();
  if (!name || !newName) {
    return NextResponse.json({ error: "name, newName 은 필수입니다." }, { status: 400 });
  }
  try {
    const data = renameStudent(name, newName.trim());
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

// 회차 삭제 (?name=민수&round=3) 또는 학생 전체 삭제 (?name=민수)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const round = searchParams.get("round");

  if (!name) {
    return NextResponse.json({ error: "name 은 필수입니다." }, { status: 400 });
  }

  if (round) {
    const data = deleteSession(name, Number(round));
    return NextResponse.json(data ?? { name, sessions: [] });
  } else {
    deleteStudent(name);
    return NextResponse.json({ ok: true });
  }
}
