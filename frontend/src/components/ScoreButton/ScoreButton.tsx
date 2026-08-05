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
      className={`${styles.btn} ${selected ? styles.selected : ''} ${
        disabled ? styles.disabled : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`ให้คะแนน ${score} ดาว — ${SCORE_LABELS[score]}`}
      aria-pressed={selected}
    >
      <span className={styles.number}>{score}</span>
    </button>
  );
});

export default ScoreButton;
