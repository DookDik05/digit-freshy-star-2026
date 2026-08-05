import { useEffect, useCallback, useState } from 'react';
import ParticleBackground from './components/ParticleBackground/ParticleBackground';
import Header from './components/Header/Header';
import ContestantTable from './components/ContestantTable/ContestantTable';
import SubmitModal from './components/SubmitModal/SubmitModal';
import ResultsPage from './components/ResultsPage/ResultsPage';
import { useScoringStore } from './store/scoringStore';
import { useScoring } from './hooks/useScoring';
import { useSocket } from './hooks/useSocket';
import { ROUNDS } from './types';
import styles from './App.module.css';

type PageView = 'scoring' | 'results';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('scoring');

  const {
    contestants,
    currentRound,
    scores,
    judgeId,
    setJudgeId,
    isLoading,
    error,
    setError,
    showModal,
    setShowModal,
    submittedRounds,
    isRoundComplete,
  } = useScoringStore();

  const { fetchContestants } = useScoring();
  useSocket();

  useEffect(() => {
    fetchContestants();
  }, [fetchContestants]);

  const handleOpenModal = useCallback(() => {
    setError(null);
    if (!judgeId.trim()) {
      setError('กรุณาระบุรหัสกรรมการก่อนส่งคะแนน');
      return;
    }
    setShowModal(true);
  }, [judgeId, setShowModal, setError]);

  const scoredCount = Object.keys(scores).length;
  const totalCount = contestants.length;
  const isSubmitted = submittedRounds.includes(currentRound);
  const canSubmit = isRoundComplete() && !isSubmitted;
  const currentRoundLabel = ROUNDS.find((r) => r.id === currentRound)?.label;

  return (
    <div className={styles.app}>
      <ParticleBackground />
      <div className={styles.glowOverlay} aria-hidden="true" />

      <div className={styles.content}>
        <Header />

        {/* ─── Page Navigation ─── */}
        <nav className={styles.pageNav} role="tablist" aria-label="เมนูหลัก">
          <button
            role="tab"
            aria-selected={currentPage === 'scoring'}
            className={`${styles.navBtn} ${currentPage === 'scoring' ? styles.navActive : ''}`}
            onClick={() => setCurrentPage('scoring')}
            id="tab-scoring"
          >
            <span className={styles.navIcon}>📋</span>
            ให้คะแนน
          </button>
          <button
            role="tab"
            aria-selected={currentPage === 'results'}
            className={`${styles.navBtn} ${currentPage === 'results' ? styles.navActive : ''}`}
            onClick={() => setCurrentPage('results')}
            id="tab-results"
          >
            <span className={styles.navIcon}>🏆</span>
            ผลคะแนน
          </button>
        </nav>

        <main className={styles.main}>
          {/* ─── SCORING PAGE ─── */}
          {currentPage === 'scoring' && (
            <>
              {/* Judge ID */}
              <div className={styles.judgeSection}>
                <label htmlFor="judgeId" className={styles.judgeLabel}>
                  รหัสกรรมการ
                </label>
                <input
                  id="judgeId"
                  type="text"
                  className={styles.judgeInput}
                  placeholder="เช่น J01, กรรมการ 1, ..."
                  value={judgeId}
                  onChange={(e) => setJudgeId(e.target.value)}
                  maxLength={30}
                  autoComplete="off"
                />
              </div>

              {/* Progress bar */}
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>{currentRoundLabel}</span>
                  <span className={styles.progressCount}>
                    {isSubmitted ? '✓ ส่งคะแนนแล้ว' : `${scoredCount} / ${totalCount} คน`}
                  </span>
                </div>
                <div
                  className={styles.progressBar}
                  role="progressbar"
                  aria-valuenow={scoredCount}
                  aria-valuemax={totalCount}
                >
                  <div
                    className={`${styles.progressFill} ${isSubmitted ? styles.progressDone : ''}`}
                    style={{
                      width: `${totalCount > 0 ? (scoredCount / totalCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Error */}
              {error && !showModal && (
                <div className={styles.errorBanner} role="alert">
                  <span>⚠️ {error}</span>
                  <button onClick={() => setError(null)} aria-label="ปิด">✕</button>
                </div>
              )}

              {/* Loading / Table */}
              {isLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner} />
                  <p>กำลังโหลดข้อมูลผู้เข้าประกวด...</p>
                </div>
              ) : (
                <>
                  <ContestantTable />

                  {/* Submit */}
                  <div className={styles.submitSection}>
                    {isSubmitted ? (
                      <div className={styles.submittedBadge}>
                        <span className={styles.checkIcon}>✓</span>
                        ส่งคะแนน {currentRoundLabel} เรียบร้อยแล้ว
                      </div>
                    ) : (
                      <button
                        id="submit-scores-btn"
                        className={`${styles.submitBtn} ${!canSubmit ? styles.submitBtnDisabled : ''}`}
                        onClick={handleOpenModal}
                      >
                        {canSubmit
                          ? `✓ ส่งคะแนน ${currentRoundLabel}`
                          : `กรุณาให้คะแนนครบ ${totalCount} คน (${scoredCount}/${totalCount})`}
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* ─── RESULTS PAGE ─── */}
          {currentPage === 'results' && <ResultsPage />}
        </main>

        <footer className={styles.footer}>
          <p>DIGIT FRESHY STAR 2026 &nbsp;·&nbsp; Faculty of Digital Technology</p>
          <p>POWER OF TECHNOLOGY</p>
        </footer>
      </div>

      {showModal && <SubmitModal />}
    </div>
  );
}
