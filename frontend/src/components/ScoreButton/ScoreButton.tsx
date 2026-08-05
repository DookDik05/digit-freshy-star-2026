import { memo } from 'react';
import styles from './ScoreButton.module.css';

interface ScoreButtonProps {
  score: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const SCORE_LABELS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

const ScoreButton = memo(function ScoreButton({
  score,
  selected,
  onClick,
  disabled = false,
}: ScoreButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.scoreBtn} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`ให้คะแนน ${score} ดาว — ${SCORE_LABELS[score]}`}
      aria-pressed={selected}
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      <span className={styles.starIcon} aria-hidden="true">★</span>
      <span className={styles.scoreVal}>{score}</span>
    </button>
  );
});

export default ScoreButton;
