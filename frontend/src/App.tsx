import { useEffect, useCallback, useState } from 'react';
import { ClipboardList, Trophy, Check, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';
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
    currentRound,
    setRound,
    scores,
    judgeId,
    setJudgeId,
    isLoading,
    error,
    setError,
    showModal,
    setShowModal,
    submittedRounds,
    getActiveContestants,
    isRoundComplete,
  } = useScoringStore();

  const { fetchContestants } = useScoring();
  useSocket();

  useEffect(() => {
    fetchContestants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = useCallback(() => {
    setError(null);
    if (!judgeId.trim()) {
      setError('กรุณาระบุรหัสกรรมการก่อนส่งคะแนน');
      return;
    }
    setShowModal(true);
  }, [judgeId, setShowModal, setError]);

  const activeContestants = getActiveContestants();
  const scoredCount = Object.keys(scores).length;
  const totalCount = activeContestants.length;
  const isSubmitted = submittedRounds.includes(currentRound);
  const canSubmit = isRoundComplete() && !isSubmitted;
  const currentRoundLabel = ROUNDS.find((r) => r.id === currentRound)?.label;

  const nextRoundObj = ROUNDS.find((r) => r.id === currentRound + 1);

  const handleNextRound = () => {
    if (currentRound < 4) {
      setRound(currentRound + 1);
    } else {
      setCurrentPage('results');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <ClipboardList size={18} className={styles.navIcon} />
            ให้คะแนน
          </button>
          <button
            role="tab"
            aria-selected={currentPage === 'results'}
            className={`${styles.navBtn} ${currentPage === 'results' ? styles.navActive : ''}`}
            onClick={() => setCurrentPage('results')}
            id="tab-results"
          >
            <Trophy size={18} className={styles.navIcon} />
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
                    {isSubmitted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={15} /> ส่งคะแนนแล้ว
                      </span>
                    ) : (
                      `${scoredCount} / ${totalCount} คน`
                    )}
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={18} /> {error}
                  </span>
                  <button onClick={() => setError(null)} aria-label="ปิด">
                    <X size={16} />
                  </button>
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                        <div className={styles.submittedBadge}>
                          <CheckCircle2 size={18} className={styles.checkIcon} />
                          ส่งคะแนน {currentRoundLabel} เรียบร้อยแล้ว
                        </div>

                        <button
                          className={styles.nextRoundBtn}
                          onClick={handleNextRound}
                        >
                          {currentRound < 4
                            ? `ไปโหวตรอบถัดไป: ${nextRoundObj?.label}`
                            : 'ดูสรุปผลคะแนนรวมการแข่งขัน'}
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                        <button
                          id="submit-scores-btn"
                          className={`${styles.submitBtn} ${!canSubmit ? styles.submitBtnDisabled : ''}`}
                          onClick={handleOpenModal}
                        >
                          {canSubmit ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={18} /> ส่งคะแนน {currentRoundLabel}
                            </span>
                          ) : (
                            `กรุณาให้คะแนนครบ ${totalCount} คน (${scoredCount}/${totalCount})`
                          )}
                        </button>

                        {currentRound < 4 && (
                          <button
                            className={styles.nextRoundLinkBtn}
                            onClick={handleNextRound}
                            title="ข้ามไปโหวตรอบถัดไป"
                          >
                            ข้ามไป {nextRoundObj?.label} <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
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
