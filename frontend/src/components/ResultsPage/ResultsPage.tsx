import { useEffect, useState, useCallback } from 'react';
import { Trophy, Crown, RotateCw, Medal, Trash2, AlertTriangle } from 'lucide-react';
import type { Contestant } from '../../types';
import { ROUNDS } from '../../types';
import styles from './ResultsPage.module.css';

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

interface RoundAverage {
  [round: number]: number;
}

interface ResultEntry {
  rank: number;
  contestantId: string;
  totalScore: number;
  averageScore: number;
  judgeCount: number;
  roundAverages: RoundAverage;
}

interface RichResult extends ResultEntry {
  contestant: Contestant | undefined;
}

const RANK_LABELS = ['อันดับ 1', 'อันดับ 2', 'อันดับ 3'];
const PODIUM_HEIGHTS = ['180px', '130px', '100px'];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={22} color="#ffd700" />;
  if (rank === 2) return <Medal size={20} color="#c0c0c0" />;
  if (rank === 3) return <Medal size={20} color="#cd7f32" />;
  return <span>{rank}</span>;
}

function StarBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className={styles.starBarWrap}>
      <div className={styles.starBar}>
        <div className={styles.starFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.starVal}>{score.toFixed(2)}</span>
    </div>
  );
}

export default function ResultsPage() {
  const [results, setResults] = useState<RichResult[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<number>(0); // 0 = overall
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, rRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/contestants`),
        fetch(`${BACKEND_URL}/api/scores/results`),
      ]);
      const cData = await cRes.json();
      const rData = await rRes.json();
      setContestants(cData.data ?? []);

      const raw: ResultEntry[] = rData.data ?? [];
      const enriched: RichResult[] = raw.map((r) => ({
        ...r,
        contestant: (cData.data as Contestant[]).find(
          (c) => c.id === r.contestantId
        ),
      }));
      setResults(enriched);
      setLastUpdated(new Date().toLocaleTimeString('th-TH'));
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetScores = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/scores/reset`, {
        method: 'POST',
      });
      if (res.ok) {
        setShowResetModal(false);
        await fetchData();
      } else {
        alert('เกิดข้อผิดพลาดในการรีเซ็ตคะแนน');
      }
    } catch (err) {
      console.error('Failed to reset scores:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsResetting(false);
    }
  };

  // Initial fetch + auto-refresh every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Filter/sort for a specific round
  const getRoundResults = useCallback(
    (round: number): RichResult[] => {
      if (round === 0) return results;

      // Re-rank by that round's average
      const withRoundScore = contestants.map((c) => {
        const found = results.find((r) => r.contestantId === c.id);
        return {
          contestantId: c.id,
          contestant: c,
          score: found?.roundAverages?.[round] ?? null,
          totalScore: found?.totalScore ?? 0,
          averageScore: found?.averageScore ?? 0,
          judgeCount: found?.judgeCount ?? 0,
          roundAverages: found?.roundAverages ?? {},
          rank: 0,
        };
      });

      const sorted = withRoundScore
        .filter((r) => r.score !== null)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      let rank = 1;
      return sorted.map((r, i) => {
        if (i > 0 && r.score !== sorted[i - 1].score) rank = i + 1;
        return { ...r, rank };
      }) as unknown as RichResult[];
    },
    [results, contestants]
  );

  const displayResults = getRoundResults(selectedRound);
  const top3 = displayResults.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>กำลังโหลดผลคะแนน...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <Trophy size={48} color="#ff6b1a" />
        </div>
        <h2>ยังไม่มีคะแนน</h2>
        <p>กรรมการยังไม่ได้ส่งคะแนน หรือระบบถูกรีเซ็ตคะแนนเรียบร้อยแล้ว</p>
        <button className={styles.refreshBtn} onClick={fetchData} style={{ marginTop: '1rem' }}>
          <RotateCw size={14} style={{ marginRight: '6px' }} /> รีเฟรชข้อมูล
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Title */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>
          <Trophy size={28} className={styles.titleIcon} />
          ผลคะแนน
        </h1>
        <p className={styles.subtitle}>DIGIT FRESHY STAR 2026 — Final Competition</p>

        <div className={styles.headerActions}>
          {lastUpdated && (
            <button className={styles.refreshBtn} onClick={fetchData}>
              <RotateCw size={14} style={{ marginRight: '6px' }} /> อัปเดตล่าสุด {lastUpdated}
            </button>
          )}
          <button
            className={styles.resetBtn}
            onClick={() => setShowResetModal(true)}
            title="รีเซ็ตคะแนนทั้งหมด"
          >
            <Trash2 size={13} /> รีเซ็ตคะแนน
          </button>
        </div>
      </div>

      {/* Round Filter */}
      <div className={styles.roundFilter}>
        <button
          className={`${styles.filterBtn} ${selectedRound === 0 ? styles.filterActive : ''}`}
          onClick={() => setSelectedRound(0)}
        >
          ภาพรวมทั้งหมด
        </button>
        {ROUNDS.map((r) => (
          <button
            key={r.id}
            className={`${styles.filterBtn} ${selectedRound === r.id ? styles.filterActive : ''}`}
            onClick={() => setSelectedRound(r.id)}
          >
            Round {r.id}
          </button>
        ))}
      </div>

      {/* Podium — Top 3 */}
      {top3.length >= 2 && (
        <div className={styles.podiumSection}>
          <div className={styles.podium}>
            {podiumOrder.map((r) => {
              const rankIdx = r.rank - 1;
              const score =
                selectedRound === 0
                  ? r.averageScore
                  : (r.roundAverages?.[selectedRound] ?? 0);
              return (
                <div
                  key={r.contestantId}
                  className={`${styles.podiumItem} ${styles[`rank${r.rank}`]}`}
                >
                  {/* Photo */}
                  <div className={styles.podiumPhotoWrap}>
                    {r.rank === 1 && (
                      <div className={styles.crownBadge}>
                        <Crown size={20} color="#ffd700" />
                      </div>
                    )}
                    <img
                      src={r.contestant?.photo ?? ''}
                      alt={r.contestant?.nickname}
                      className={styles.podiumPhoto}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${r.contestant?.nickname}&background=e63012&color=fff&bold=true`;
                      }}
                    />
                  </div>

                  {/* Name */}
                  <div className={styles.podiumName}>
                    <span className={styles.podiumNick}>
                      {r.contestant?.nickname}
                    </span>
                    <span className={styles.podiumDigit}>
                      DIGIT {String(r.contestant?.number ?? 0).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Score */}
                  <div className={styles.podiumScoreBox}>
                    <span className={styles.podiumScore}>
                      {score.toFixed(2)}
                    </span>
                    <span className={styles.podiumScoreLabel}>คะแนนเฉลี่ย</span>
                  </div>

                  {/* Pillar */}
                  <div
                    className={`${styles.pillar} ${styles[`pillar${r.rank}`]}`}
                    style={{ height: PODIUM_HEIGHTS[rankIdx] ?? '80px' }}
                  >
                    <span className={styles.pillarRank}>
                      <RankIcon rank={r.rank} />
                    </span>
                    <span className={styles.pillarLabel}>
                      {RANK_LABELS[rankIdx] ?? `อันดับ ${r.rank}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className={styles.leaderboard}>
        <h2 className={styles.leaderTitle}>ตารางคะแนนทั้งหมด</h2>
        <div className={styles.leaderTable}>
          <div className={styles.leaderHeader}>
            <span className={styles.colRank}>อันดับ</span>
            <span className={styles.colName}>ผู้เข้าประกวด</span>
            {selectedRound === 0
              ? ROUNDS.map((r) => (
                  <span key={r.id} className={styles.colRound}>
                    R{r.id}
                  </span>
                ))
              : null}
            <span className={styles.colAvg}>
              {selectedRound === 0 ? 'เฉลี่ยรวม' : `Round ${selectedRound}`}
            </span>
          </div>

          {displayResults.map((r) => {
            const avgScore =
              selectedRound === 0
                ? r.averageScore
                : (r.roundAverages?.[selectedRound] ?? 0);
            return (
              <div
                key={r.contestantId}
                className={`${styles.leaderRow} ${r.rank <= 3 ? styles[`leaderTop${r.rank}`] : ''}`}
              >
                {/* Rank */}
                <span className={styles.colRank}>
                  {r.rank <= 3 ? (
                    <span className={styles.rankIcon} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RankIcon rank={r.rank} />
                    </span>
                  ) : (
                    <span className={styles.rankNum}>{r.rank}</span>
                  )}
                </span>

                {/* Contestant */}
                <span className={styles.colName}>
                  <div className={styles.leaderContestant}>
                    <img
                      src={r.contestant?.photo ?? ''}
                      alt={r.contestant?.nickname}
                      className={styles.leaderPhoto}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${r.contestant?.nickname}&background=e63012&color=fff&bold=true&size=64`;
                      }}
                    />
                    <div className={styles.leaderInfo}>
                      <span className={styles.leaderNick}>
                        {r.contestant?.nickname}
                      </span>
                      <span className={styles.leaderFull}>
                        DIGIT {String(r.contestant?.number ?? 0).padStart(2, '0')} · {r.contestant?.name}
                      </span>
                    </div>
                  </div>
                </span>

                {/* Per-round scores */}
                {selectedRound === 0
                  ? ROUNDS.map((round) => (
                      <span key={round.id} className={styles.colRound}>
                        {r.roundAverages?.[round.id] != null ? (
                          <span className={styles.roundScore}>
                            {r.roundAverages[round.id].toFixed(1)}
                          </span>
                        ) : (
                          <span className={styles.noScore}>—</span>
                        )}
                      </span>
                    ))
                  : null}

                {/* Average */}
                <span className={styles.colAvg}>
                  <StarBar score={avgScore} />
                </span>
              </div>
            );
          })}
        </div>

        {/* Judge count note */}
        {results.length > 0 && (
          <p className={styles.judgeNote}>
            * คำนวณจากคะแนนกรรมการ {results[0]?.judgeCount ?? 0} ท่าน ·{' '}
            อัปเดตทุก 10 วินาที
          </p>
        )}
      </div>

      {/* Confirmation Modal for Resetting Scores */}
      {showResetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowResetModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <AlertTriangle size={32} />
            </div>
            <h3 className={styles.modalTitle}>ยืนยันการรีเซ็ตผลคะแนน?</h3>
            <p className={styles.modalDesc}>
              การกระทำนี้จะลบผลคะแนนและตารางอันดับทั้งหมดที่กรรมการส่งเข้ามา และไม่สามารถย้อนกลับได้
            </p>
            <div className={styles.modalBtns}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
              >
                ยกเลิก
              </button>
              <button
                className={styles.confirmResetBtn}
                onClick={handleResetScores}
                disabled={isResetting}
              >
                {isResetting ? 'กำลังรีเซ็ต...' : 'ยืนยันรีเซ็ตคะแนน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
