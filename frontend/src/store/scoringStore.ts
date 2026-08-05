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
  qualifiedTop7Ids: string[];// contestant IDs that qualified for Round 4 (Top 7)
  isLoading: boolean;
  isSubmitting: boolean;
  showModal: boolean;
  error: string | null;

  // Actions
  setContestants: (contestants: Contestant[]) => void;
  setJudgeId: (id: string) => void;
  setRound: (round: number) => void;
  setScore: (contestantId: string, score: number) => void;
  setQualifiedTop7Ids: (ids: string[]) => void;
  setShowModal: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  markRoundSubmitted: (round: number) => void;
  resetScores: () => void;
  getActiveContestants: () => Contestant[];
  isRoundComplete: () => boolean;
}

export const useScoringStore = create<ScoringState>((set, get) => ({
  contestants: [],
  judgeId: '',
  currentRound: 1,
  scores: {},
  submittedRounds: [],
  qualifiedTop7Ids: [],
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
  setQualifiedTop7Ids: (qualifiedTop7Ids) => set({ qualifiedTop7Ids }),
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
  resetScores: () => set({ scores: {}, submittedRounds: [], qualifiedTop7Ids: [] }),
  getActiveContestants: () => {
    const state = get();
    if (state.currentRound === 4) {
      if (state.qualifiedTop7Ids.length > 0) {
        return state.contestants.filter((c) =>
          state.qualifiedTop7Ids.includes(c.id)
        );
      }
      // Fallback to first 7 if top 7 not calculated yet
      return state.contestants.slice(0, 7);
    }
    return state.contestants;
  },
  isRoundComplete: () => {
    const state = get();
    const active = state.getActiveContestants();
    return (
      active.length > 0 &&
      active.every((c) => state.scores[c.id] !== undefined)
    );
  },
}));
