import express, { Request, Response } from 'express';
import { getBenchmarks, getUserBenchmarks } from '../controllers/benchmarksController';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const benchmarks = await getBenchmarks()
  return res.json(benchmarks);
});

router.get('/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  const benchmarks = await getUserBenchmarks(username);
  return res.json(benchmarks);
});

export default router;
