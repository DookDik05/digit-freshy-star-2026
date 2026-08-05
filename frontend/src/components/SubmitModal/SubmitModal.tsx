import { useCallback, useEffect } from 'react';
import styles from './SubmitModal.module.css';
import { useScoringStore } from '../../store/scoringStore';
import { useScoring } from '../../hooks/useScoring';
import { ROUNDS } from '../../types';

export default function SubmitModal() {
  const {
    showModal,
    setShowModal,
    contestants,
    scores,
    currentRound,
    judgeId,
    isSubmitting,
    error,
    setError,
  } = useScoringStore();
  const { submitScores } = useScoring();

  const currentRoundLabel =
    ROUNDS.find((r) => r.id === currentRound)?.label ?? `Round ${currentRound}`;

  const handleClose = useCallback(() => {
    setShowModal(false);
    setError(null);
  }, [setShowModal, setError]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isSubmitting, handleClose]);

  const handleSubmit = useCallback(async () => {
    await submitScores();
  }, [submitScores]);

  if (!showModal) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={styles.modal} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.title}>
            ยืนยันการส่งคะแนน
          </h2>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Round</span>
            <span className={styles.infoValue}>{currentRoundLabel}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>กรรมการ</span>
            <span className={styles.infoValue}>{judgeId || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>คะแนนที่ให้</span>
            <span className={styles.infoValue}>
              {Object.keys(scores).length} / {contestants.length} คน
            </span>
          </div>
        </div>

        {/* Score Summary */}
        <div className={styles.summary}>
          {contestants.map((c) => (
            <div key={c.id} className={styles.summaryRow}>
              <span className={styles.summaryName}>{c.nickname}</span>
              <div className={styles.summaryScore}>
                {scores[c.id] !== undefined ? (
                  <span className={styles.score}>{scores[c.id]}</span>
                ) : (
                  <span className={styles.missing}>ยังไม่ได้ให้คะแนน</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={handleClose} disabled={isSubmitting}>
            ยกเลิก
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.spinner} />
            ) : (
              '✓ ยืนยันส่งคะแนน'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
