import type { Score } from '../types';

// In-memory store — upgradeable to a real DB later
const scores: Score[] = [];

export function getAllScores(): Score[] {
  return scores;
}

export function resetAllScores(): void {
  scores.length = 0;
}

export function getScoresByRound(round: number): Score[] {
  return scores.filter((s) => s.round === round);
}

export function getScoresByContestant(contestantId: string): Score[] {
  return scores.filter((s) => s.contestantId === contestantId);
}

export function getScoreByJudgeContestantRound(
  judgeId: string,
  contestantId: string,
  round: number
): Score | undefined {
  return scores.find(
    (s) =>
      s.judgeId === judgeId &&
      s.contestantId === contestantId &&
      s.round === round
  );
}

export function upsertScore(newScore: Score): Score {
  const idx = scores.findIndex(
    (s) =>
      s.judgeId === newScore.judgeId &&
      s.contestantId === newScore.contestantId &&
      s.round === newScore.round
  );

  if (idx !== -1) {
    scores[idx] = { ...newScore, timestamp: new Date().toISOString() };
    return scores[idx];
  } else {
    scores.push(newScore);
    return newScore;
  }
}

export function getSummaryByRound(round: number) {
  const roundScores = getScoresByRound(round);
  const contestantMap = new Map<string, number[]>();

  for (const s of roundScores) {
    if (!contestantMap.has(s.contestantId)) {
      contestantMap.set(s.contestantId, []);
    }
    contestantMap.get(s.contestantId)!.push(s.score);
  }

  return Array.from(contestantMap.entries()).map(([contestantId, scoreArr]) => ({
    contestantId,
    round,
    totalScore: scoreArr.reduce((a, b) => a + b, 0),
    judgeCount: scoreArr.length,
    averageScore:
      scoreArr.length > 0
        ? scoreArr.reduce((a, b) => a + b, 0) / scoreArr.length
        : 0,
  }));
}

/** Aggregate scores across ALL rounds per contestant, sorted by totalScore desc */
export function getOverallResults() {
  const contestantMap = new Map<
    string,
    { scoreList: number[]; byRound: Record<number, number[]>; judgeIds: Set<string> }
  >();

  for (const s of scores) {
    if (!contestantMap.has(s.contestantId)) {
      contestantMap.set(s.contestantId, { scoreList: [], byRound: {}, judgeIds: new Set() });
    }
    const entry = contestantMap.get(s.contestantId)!;
    entry.scoreList.push(s.score);
    entry.judgeIds.add(s.judgeId);
    if (!entry.byRound[s.round]) entry.byRound[s.round] = [];
    entry.byRound[s.round].push(s.score);
  }

  const results = Array.from(contestantMap.entries()).map(
    ([contestantId, data]) => {
      const total = data.scoreList.reduce((a, b) => a + b, 0);
      const avg = data.scoreList.length > 0 ? total / data.scoreList.length : 0;

      const roundAverages: Record<number, number> = {};
      for (const [round, roundScores] of Object.entries(data.byRound)) {
        roundAverages[Number(round)] =
          Math.round((roundScores.reduce((a, b) => a + b, 0) / roundScores.length) * 100) / 100;
      }

      return {
        contestantId,
        totalScore: total,
        averageScore: Math.round(avg * 100) / 100,
        judgeCount: data.judgeIds.size,
        roundAverages,
      };
    }
  );

  // Sort by averageScore descending, then totalScore
  results.sort((a, b) =>
    b.averageScore !== a.averageScore
      ? b.averageScore - a.averageScore
      : b.totalScore - a.totalScore
  );

  // Assign rank with tie handling
  let rank = 1;
  return results.map((r, i) => {
    if (i > 0 && r.averageScore < results[i - 1].averageScore) rank = i + 1;
    return { ...r, rank };
  });
}
