import { useCallback } from 'react';
import { useScoringStore } from '../store/scoringStore';

const getBackendUrl = () => {
  if (import.meta.env.PROD) {
    const customUrl = import.meta.env.VITE_BACKEND_URL;
    if (customUrl && !customUrl.includes('localhost')) {
      return customUrl;
    }
    return '';
  }
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
};

const BACKEND_URL = getBackendUrl();

export function useScoring() {
  const store = useScoringStore();

  const fetchContestants = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/contestants`);
      if (!res.ok) throw new Error('Failed to fetch contestants');
      const data = await res.json();
      store.setContestants(data.data);
    } catch (err) {
      store.setError('ไม่สามารถโหลดข้อมูลผู้เข้าประกวดได้ กรุณาลองใหม่');
      console.error(err);
    } finally {
      store.setLoading(false);
    }
  }, []);

  const submitScores = useCallback(async () => {
    if (!store.judgeId.trim()) {
      store.setError('กรุณาระบุรหัสกรรมการก่อนส่งคะแนน');
      return;
    }

    store.setSubmitting(true);
    store.setError(null);

    try {
      const submissions = Object.entries(store.scores).map(
        ([contestantId, score]) => ({
          contestantId,
          judgeId: store.judgeId.trim(),
          round: store.currentRound,
          score,
        })
      );

      const results = await Promise.allSettled(
        submissions.map((sub) =>
          fetch(`${BACKEND_URL}/api/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub),
          })
        )
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`${failed.length} คะแนนส่งไม่สำเร็จ`);
      }

      store.markRoundSubmitted(store.currentRound);
      store.setShowModal(false);
    } catch (err) {
      store.setError('เกิดข้อผิดพลาดในการส่งคะแนน กรุณาลองใหม่');
      console.error(err);
    } finally {
      store.setSubmitting(false);
    }
  }, [store]);

  return { fetchContestants, submitScores };
}
