import { memo, useState, useCallback } from 'react';
import type { Contestant } from '../../types';
import ScoreButton from '../ScoreButton/ScoreButton';
import styles from './ContestantTable.module.css';
import { useScoringStore } from '../../store/scoringStore';

interface ContestantRowProps {
  contestant: Contestant;
  currentScore: number | undefined;
  submitted: boolean;
  onScore: (contestantId: string, score: number) => void;
}

const ContestantRow = memo(function ContestantRow({
  contestant,
  currentScore,
  submitted,
  onScore,
}: ContestantRowProps) {
  const [imgError, setImgError] = useState(false);

  const handleScore = useCallback(
    (score: number) => {
      onScore(contestant.id, score);
    },
    [contestant.id, onScore]
  );

  return (
    <tr className={`${styles.row} ${currentScore !== undefined ? styles.scored : ''}`}>
      {/* Number */}
      <td className={styles.numCell}>
        <span className={styles.numBadge}>{contestant.number}</span>
      </td>

      {/* Photo + Name */}
      <td className={styles.photoCell}>
        <div className={styles.contestant}>
          <div className={styles.photoWrapper}>
            {!imgError ? (
              <img
                src={contestant.photo}
                alt={contestant.name}
                className={styles.photo}
                loading="eager"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={styles.photoFallback} title={contestant.name}>
                <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>DIGIT</span>
                <strong style={{ fontSize: '0.8rem', lineHeight: 1 }}>{String(contestant.number).padStart(2, '0')}</strong>
              </div>
            )}
          </div>
          <div className={styles.info}>
            <span className={styles.name}>{contestant.name}</span>
            <span className={styles.nickname}>"{contestant.nickname}"</span>
          </div>
        </div>
      </td>

      {/* Score Buttons 1-5 */}
      {[1, 2, 3, 4, 5].map((score) => (
        <td key={score} className={styles.scoreCell}>
          <ScoreButton
            score={score}
            selected={currentScore === score}
            onClick={() => handleScore(score)}
            disabled={submitted}
          />
        </td>
      ))}

      {/* Current score indicator */}
      <td className={styles.currentCell}>
        {currentScore !== undefined ? (
          <span className={styles.currentScore}>{currentScore}</span>
        ) : (
          <span className={styles.pending}>—</span>
        )}
      </td>
    </tr>
  );
});

export default function ContestantTable() {
  const { getActiveContestants, scores, currentRound, submittedRounds, setScore } =
    useScoringStore();

  const activeContestants = getActiveContestants();
  const isSubmitted = submittedRounds.includes(currentRound);

  const handleScore = useCallback(
    (contestantId: string, score: number) => {
      if (!isSubmitted) {
        setScore(contestantId, score);
      }
    },
    [isSubmitted, setScore]
  );

  if (activeContestants.length === 0) return null;

  return (
    <div className={styles.tableWrapper}>
      {currentRound === 4 && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, rgba(230, 48, 18, 0.2), rgba(255, 107, 26, 0.15))',
          border: '1px solid rgba(255, 107, 26, 0.4)',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#ffb450',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 0 14px rgba(230, 48, 18, 0.2)'
        }}>
          🏆 รอบตอบคำถาม (Round 4): แสดงเฉพาะผู้เข้าประกวด 7 คนสุดท้ายที่ผ่านเข้ารอบ (3 คนตกรอบ)
        </div>
      )}
      <table className={styles.table} role="grid" aria-label="ตารางให้คะแนนผู้เข้าประกวด">
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.thNum}>#</th>
            <th className={styles.thPhoto}>ผู้เข้าประกวด</th>
            {[1, 2, 3, 4, 5].map((s) => (
              <th key={s} className={styles.thScore}>
                {s}
              </th>
            ))}
            <th className={styles.thCurrent}>คะแนน</th>
          </tr>
        </thead>
        <tbody>
          {activeContestants.map((c) => (
            <ContestantRow
              key={c.id}
              contestant={c}
              currentScore={scores[c.id]}
              submitted={isSubmitted}
              onScore={handleScore}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
