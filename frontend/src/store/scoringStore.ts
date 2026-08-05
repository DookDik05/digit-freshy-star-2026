import { create } from 'zustand';
import type { Contestant } from '../types';

interface ScoreMap {
  [contestantId: string]: number; // score 1-5
}

interface ScoringState {
  contestants: Contestant[];
  judgeId: string;
  currentRound: number;
  scores: ScoreMap;          // draft scores (not yet submitted)
  submittedRounds: number[]; // rounds that have been submitted
  isLoading: boolean;
  isSubmitting: boolean;
  showModal: boolean;
  error: string | null;

  // Actions
  setContestants: (contestants: Contestant[]) => void;
  setJudgeId: (id: string) => void;
  setRound: (round: number) => void;
  setScore: (contestantId: string, score: number) => void;
  setShowModal: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  markRoundSubmitted: (round: number) => void;
  resetScores: () => void;
  isRoundComplete: () => boolean;
}

export const useScoringStore = create<ScoringState>((set, get) => ({
  contestants: [],
  judgeId: '',
  currentRound: 1,
  scores: {},
  submittedRounds: [],
  isLoading: false,
  isSubmitting: false,
  showModal: false,
  error: null,

  setContestants: (contestants) => set({ contestants }),
  setJudgeId: (judgeId) => set({ judgeId }),
  setRound: (round) => set({ currentRound: round, scores: {} }),
  setScore: (contestantId, score) =>
    set((state) => ({
      scores: { ...state.scores, [contestantId]: score },
    })),
  setShowModal: (showModal) => set({ showModal }),
  setLoading: (isLoading) => set({ isLoading }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
  markRoundSubmitted: (round) =>
    set((state) => ({
      submittedRounds: state.submittedRounds.includes(round)
        ? state.submittedRounds
        : [...state.submittedRounds, round],
    })),
  resetScores: () => set({ scores: {} }),
  isRoundComplete: () => {
    const state = get();
    return (
      state.contestants.length > 0 &&
      state.contestants.every((c) => state.scores[c.id] !== undefined)
    );
  },
}));
