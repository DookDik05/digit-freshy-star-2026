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
  const setContestants = useScoringStore((s) => s.setContestants);
  const setQualifiedTop7Ids = useScoringStore((s) => s.setQualifiedTop7Ids);
  const setLoading = useScoringStore((s) => s.setLoading);
  const setError = useScoringStore((s) => s.setError);
  const setSubmitting = useScoringStore((s) => s.setSubmitting);
  const setShowModal = useScoringStore((s) => s.setShowModal);
  const markRoundSubmitted = useScoringStore((s) => s.markRoundSubmitted);

  const fetchContestants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/contestants`);
      if (!res.ok) throw new Error('Failed to fetch contestants');
      const data = await res.json();
      setContestants(data.data);
      
      // Fetch top 7 silently
      const rRes = await fetch(`${BACKEND_URL}/api/scores/results`);
      if (rRes.ok) {
        const json = await rRes.json();
        const results = json.data ?? [];
        if (results.length > 0) {
          const top7 = results
            .slice(0, 7)
            .map((r: { contestantId: string }) => r.contestantId);
          setQualifiedTop7Ids(top7);
        }
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลผู้เข้าประกวดได้ กรุณาลองใหม่');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setContestants, setError, setLoading, setQualifiedTop7Ids]);

  const submitScores = useCallback(async () => {
    const { judgeId, scores, currentRound } = useScoringStore.getState();

    if (!judgeId.trim()) {
      setError('กรุณาระบุรหัสกรรมการก่อนส่งคะแนน');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const submissions = Object.entries(scores).map(
        ([contestantId, score]) => ({
          contestantId,
          judgeId: judgeId.trim(),
          round: currentRound,
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

      markRoundSubmitted(currentRound);
      setShowModal(false);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งคะแนน กรุณาลองใหม่');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [setError, setSubmitting, markRoundSubmitted, setShowModal]);

  return { fetchContestants, submitScores };
}
