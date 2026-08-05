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

  const fetchTop7Qualified = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/scores/results`);
      if (res.ok) {
        const json = await res.json();
        const results = json.data ?? [];
        if (results.length > 0) {
          const top7 = results
            .slice(0, 7)
            .map((r: { contestantId: string }) => r.contestantId);
          store.setQualifiedTop7Ids(top7);
        }
      }
    } catch (err) {
      console.error('Failed to fetch top 7 qualified:', err);
    }
  }, [store]);

  const fetchContestants = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/contestants`);
      if (!res.ok) throw new Error('Failed to fetch contestants');
      const data = await res.json();
      store.setContestants(data.data);
      await fetchTop7Qualified();
    } catch (err) {
      store.setError('ไม่สามารถโหลดข้อมูลผู้เข้าประกวดได้ กรุณาลองใหม่');
      console.error(err);
    } finally {
      store.setLoading(false);
    }
  }, [fetchTop7Qualified]);

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

      const res = await fetch(`${BACKEND_URL}/api/scores/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissions),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'ส่งคะแนนไม่สำเร็จ');
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
