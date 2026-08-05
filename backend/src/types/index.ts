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

export interface ScoreSummary {
  contestantId: string;
  round: number;
  totalScore: number;
  judgeCount: number;
  averageScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
