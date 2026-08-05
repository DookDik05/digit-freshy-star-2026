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
  setAllScores: (score: number) => void;
  clearDraftScores: () => void;
  setQualifiedTop7Ids: (ids: string[]) => void;
  setShowModal: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  markRoundSubmitted: (round: number) => void;
  unmarkRoundSubmitted: (round: number) => void;
  resetScores: () => void;
  getActiveContestants: () => Contestant[];
  isRoundComplete: () => boolean;
}

const SAVED_JUDGE_ID = typeof window !== 'undefined' ? localStorage.getItem('digit_judge_id') || '' : '';

export const useScoringStore = create<ScoringState>((set, get) => ({
  contestants: [],
  judgeId: SAVED_JUDGE_ID,
  currentRound: 1,
  scores: {},
  submittedRounds: [],
  qualifiedTop7Ids: [],
  isLoading: false,
  isSubmitting: false,
  showModal: false,
  error: null,

  setContestants: (contestants) => set({ contestants }),
  setJudgeId: (judgeId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('digit_judge_id', judgeId);
    }
    set({ judgeId });
  },
  setRound: (round) => set({ currentRound: round, scores: {} }),
  setScore: (contestantId, score) =>
    set((state) => ({
      scores: { ...state.scores, [contestantId]: score },
    })),
  setAllScores: (score) => {
    const state = get();
    const active = state.getActiveContestants();
    const newScores: ScoreMap = {};
    active.forEach((c) => {
      newScores[c.id] = score;
    });
    set({ scores: newScores });
  },
  clearDraftScores: () => set({ scores: {} }),
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
  unmarkRoundSubmitted: (round) =>
    set((state) => ({
      submittedRounds: state.submittedRounds.filter((r) => r !== round),
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
