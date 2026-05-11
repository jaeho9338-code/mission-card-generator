export interface Session {
  round: number;
  prompt: string;
  note: string;
  savedAt: string;
}

export interface StudentData {
  name: string;
  sessions: Session[];
}
