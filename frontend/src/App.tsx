import { useEffect, useCallback, useState } from 'react';
import { ClipboardList, Trophy, Check, CheckCircle2, AlertCircle, X, Zap, RotateCcw, Edit3, Star } from 'lucide-react';
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

const PRESET_JUDGES = [
  'J01 — กรรมการ 1',
  'J02 — กรรมการ 2',
  'J03 — กรรมการ 3',
  'J04 — กรรมการ 4',
  'J05 — กรรมการ 5',
  'J06 — กรรมการ 6',
  'J07 — กรรมการ 7',
  'J08 — กรรมการ 8',
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('scoring');

  const {
    contestants,
    currentRound,
    scores,
    judgeId,
    setJudgeId,
    setAllScores,
    clearDraftScores,
    isLoading,
    error,
    setError,
    showModal,
    setShowModal,
    submittedRounds,
    unmarkRoundSubmitted,
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
              {/* Judge ID Group with Preset Selection */}
              <div className={styles.judgeSection}>
                <label htmlFor="judgeId" className={styles.judgeLabel}>
                  รหัสกรรมการ
                </label>
                <div className={styles.judgeInputGroup}>
                  <select
                    className={styles.judgeSelect}
                    value={PRESET_JUDGES.some((j) => j.startsWith(judgeId)) ? judgeId : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const code = e.target.value.split(' ')[0];
                        setJudgeId(code);
                      }
                    }}
                    aria-label="เลือกรหัสกรรมการลัด"
                  >
                    <option value="">-- เลือกรหัสลัด --</option>
                    {PRESET_JUDGES.map((j) => {
                      const code = j.split(' ')[0];
                      return (
                        <option key={code} value={code}>
                          {j}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    id="judgeId"
                    type="text"
                    className={styles.judgeInput}
                    placeholder="หรือพิมพ์รหัสกรรมการ (เช่น J01)"
                    value={judgeId}
                    onChange={(e) => setJudgeId(e.target.value)}
                    maxLength={30}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Quick Scoring Toolbar */}
              {!isSubmitted && (
                <div className={styles.quickToolbar}>
                  <span className={styles.quickTitle}>
                    <Zap size={14} color="#ff6b1a" /> ทางลัดให้คะแนน:
                  </span>
                  <div className={styles.quickBtns}>
                    <button
                      type="button"
                      className={styles.quickBtn}
                      onClick={() => setAllScores(5)}
                      title="ให้ 5 ดาวเต็มทุกคน"
                    >
                      <Star size={12} fill="currentColor" color="#ff6b1a" /> ให้ 5 ดาวทุกคน
                    </button>
                    <button
                      type="button"
                      className={styles.quickBtn}
                      onClick={() => setAllScores(4)}
                      title="ให้ 4 ดาวทุกคน"
                    >
                      <Star size={12} fill="currentColor" color="#ff6b1a" /> ให้ 4 ดาวทุกคน
                    </button>
                    {scoredCount > 0 && (
                      <button
                        type="button"
                        className={`${styles.quickBtn} ${styles.clearBtn}`}
                        onClick={clearDraftScores}
                        title="ล้างคะแนนที่เลือกอยู่ทั้งหมด"
                      >
                        <RotateCcw size={12} /> ล้างคะแนนร่าง
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>{currentRoundLabel}</span>
                  <span className={styles.progressCount}>
                    {isSubmitted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={15} /> ส่งคะแนนเรียบร้อยแล้ว
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                        <div className={styles.submittedBadge}>
                          <CheckCircle2 size={18} className={styles.checkIcon} />
                          ส่งคะแนน {currentRoundLabel} เรียบร้อยแล้ว
                        </div>
                        <button
                          type="button"
                          className={styles.nextRoundLinkBtn}
                          onClick={() => unmarkRoundSubmitted(currentRound)}
                        >
                          <Edit3 size={14} /> ปลดล็อกเพื่อแก้ไขคะแนนรอบนี้
                        </button>
                      </div>
                    ) : (
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
