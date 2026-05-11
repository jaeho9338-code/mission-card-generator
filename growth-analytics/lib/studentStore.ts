import fs from "fs";
import path from "path";
import { StudentData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function listStudents(): StudentData[] {
  ensureDataDir();
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(DATA_DIR, f), "utf-8");
      return JSON.parse(raw) as StudentData;
    });
}

export function loadStudent(name: string): StudentData | null {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf-8")) as StudentData;
}

export function saveSession(
  name: string,
  round: number,
  prompt: string,
  note: string
): StudentData {
  ensureDataDir();
  let data = loadStudent(name);
  if (!data) data = { name, sessions: [] };

  const idx = data.sessions.findIndex((s) => s.round === round);
  const session = { round, prompt, note, savedAt: new Date().toISOString() };
  if (idx >= 0) {
    data.sessions[idx] = session;
  } else {
    data.sessions.push(session);
    data.sessions.sort((a, b) => a.round - b.round);
  }

  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
  return data;
}
