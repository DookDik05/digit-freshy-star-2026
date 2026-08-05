import styles from './Header.module.css';
import { ROUNDS } from '../../types';
import { useScoringStore } from '../../store/scoringStore';

export default function Header() {
  const { currentRound, setRound, submittedRounds, judgeId, setJudgeId } = useScoringStore();

  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <div className={styles.logoText}>
          <span className={styles.digit}>DIGIT</span>
          <span className={styles.year}>2026</span>
          <div className={styles.freshyStar}>FRESHY STAR</div>
          <div className={styles.tagline}>POWER OF TECHNOLOGY</div>
        </div>
        <div className={styles.eventBadge}>FINAL COMPETITION</div>

        <div className={styles.judgeInputGroup}>
          <label htmlFor="judge-id-input" className={styles.judgeLabel}>
            JUDGE ID:
          </label>
          <input
            id="judge-id-input"
            type="text"
            className={styles.judgeInput}
            placeholder="ใส่รหัสกรรมการ (เช่น J01)"
            value={judgeId}
            onChange={(e) => setJudgeId(e.target.value)}
            maxLength={10}
            aria-label="รหัสกรรมการ"
          />
        </div>
      </div>

      <nav className={styles.roundSelector} aria-label="เลือกรอบการแข่งขัน">
        <p className={styles.roundLabel}>เลือก Round การให้คะแนน</p>
        <div className={styles.roundButtons} role="tablist">
          {ROUNDS.map((r) => {
            const isSubmitted = submittedRounds.includes(r.id);
            const isSelected = currentRound === r.id;
            return (
              <button
                key={r.id}
                role="tab"
                aria-selected={isSelected}
                className={`${styles.roundBtn} ${
                  isSelected ? styles.active : ''
                } ${isSubmitted ? styles.submitted : ''}`}
                onClick={() => setRound(r.id)}
              >
                {isSubmitted && <span className={styles.checkmark}>✓ </span>}
                {r.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
