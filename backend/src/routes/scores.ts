import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  upsertScore,
  getAllScores,
  getScoresByRound,
  getSummaryByRound,
  getOverallResults,
  resetAllScores,
} from '../data/scoreStore';
import type { ApiResponse, Score } from '../types';
import { Server as SocketServer } from 'socket.io';

const router = Router();

// Zod schema for score submission
const ScoreSchema = z.object({
  contestantId: z.string().min(1),
  judgeId: z.string().min(1),
  round: z.number().int().min(1).max(4),
  score: z.number().int().min(1).max(5),
});

// Attach Socket.IO server to router
export function createScoreRouter(io: SocketServer) {
  // POST & DELETE /api/scores/reset — Reset all scores
  const handleReset = (_req: Request, res: Response) => {
    resetAllScores();
    io.emit('scoreReset');
    res.json({
      success: true,
      message: 'รีเซ็ตคะแนนทั้งหมดเรียบร้อยแล้ว',
    });
  };

  router.post('/reset', handleReset);
  router.delete('/reset', handleReset);

  // GET /api/scores — All scores
  router.get('/', (_req: Request, res: Response) => {
    const response: ApiResponse<Score[]> = {
      success: true,
      data: getAllScores(),
    };
    res.json(response);
  });

  // GET /api/scores/round/:round — Scores by round
  router.get('/round/:round', (req: Request, res: Response) => {
    const round = parseInt(req.params.round);
    if (isNaN(round) || round < 1 || round > 4) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid round (1-4)' });
    }
    const scores = getScoresByRound(round);
    res.json({ success: true, data: scores });
  });

  // GET /api/scores/summary/:round — Summary by round
  router.get('/summary/:round', (req: Request, res: Response) => {
    const round = parseInt(req.params.round);
    if (isNaN(round) || round < 1 || round > 4) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid round (1-4)' });
    }
    const summary = getSummaryByRound(round);
    res.json({ success: true, data: summary });
  });

  // GET /api/scores/results — Overall rankings across all rounds
  router.get('/results', (_req: Request, res: Response) => {
    const results = getOverallResults();
    res.json({ success: true, data: results });
  });

  // POST /api/scores/batch — Submit multiple scores at once
  router.post('/batch', (req: Request, res: Response) => {
    const BatchSchema = z.array(ScoreSchema);
    const result = BatchSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch input',
        details: result.error.flatten(),
      });
    }

    const savedScores: Score[] = [];
    for (const item of result.data) {
      const newScore: Score = {
        id: uuidv4(),
        contestantId: item.contestantId,
        judgeId: item.judgeId,
        round: item.round,
        score: item.score,
        timestamp: new Date().toISOString(),
      };
      savedScores.push(upsertScore(newScore));
    }

    // Broadcast update to all connected clients
    io.emit('scoreUpdate', {
      round: result.data[0]?.round,
      judgeId: result.data[0]?.judgeId,
      count: savedScores.length,
    });

    res.status(201).json({
      success: true,
      data: savedScores,
      message: `บันทึกคะแนน ${savedScores.length} รายการสำเร็จ`,
    });
  });

  // POST /api/scores — Submit a single score
  router.post('/', (req: Request, res: Response) => {
    const result = ScoreSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: result.error.flatten(),
      });
    }

    const { contestantId, judgeId, round, score } = result.data;

    const newScore: Score = {
      id: uuidv4(),
      contestantId,
      judgeId,
      round,
      score,
      timestamp: new Date().toISOString(),
    };

    const saved = upsertScore(newScore);

    // Broadcast update to all connected clients
    io.emit('scoreUpdate', {
      contestantId,
      judgeId,
      round,
      score,
    });

    const response: ApiResponse<Score> = {
      success: true,
      data: saved,
      message: 'Score submitted successfully',
    };
    res.status(201).json(response);
  });

  return router;
}
