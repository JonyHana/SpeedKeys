import express, { Request, Response } from 'express';
import { getBenchmarks, getUserBenchmarks } from '../controllers/benchmarksController';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  return await getBenchmarks();
});

router.get('/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  return await getUserBenchmarks(username);
});

export default router;
