export interface Contestant {
  id: string;
  number: number;
  name: string;
  nickname: string;
  photo: string;
  faculty?: string;
}

export interface Score {
  id: string;
  contestantId: string;
  judgeId: string;
  round: number;
  score: number;
  timestamp: string;
}

export interface ScoreSubmission {
  contestantId: string;
  judgeId: string;
  round: number;
  score: number;
}

export type RoundOption = {
  id: number;
  label: string;
};

export const ROUNDS: RoundOption[] = [
  { id: 1, label: 'Round 1 — เปิดตัว' },
  { id: 2, label: 'Round 2 — Speech' },
  { id: 3, label: 'Round 3 — ชุดนักศึกษา' },
  { id: 4, label: 'Round 4 — ตอบคำถาม' },
];
