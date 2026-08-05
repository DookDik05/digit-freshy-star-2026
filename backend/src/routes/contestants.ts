import { Router, Request, Response } from 'express';
import { contestants } from '../data/contestants';
import { ApiResponse, Contestant } from '../types';

const router = Router();

// GET /api/contestants — Return all contestants
router.get('/', (_req: Request, res: Response) => {
  const response: ApiResponse<Contestant[]> = {
    success: true,
    data: contestants,
  };
  res.json(response);
});

// GET /api/contestants/:id — Return single contestant
router.get('/:id', (req: Request, res: Response) => {
  const contestant = contestants.find((c) => c.id === req.params.id);
  if (!contestant) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Contestant not found',
    };
    return res.status(404).json(response);
  }
  const response: ApiResponse<Contestant> = {
    success: true,
    data: contestant,
  };
  res.json(response);
});

export default router;
