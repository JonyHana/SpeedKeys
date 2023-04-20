import express, { Request, Response } from 'express';
import { prisma } from '../utils/db';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const benchmarks = await prisma.benchmark.findMany({
    take: 10,
    select: {
      WPM: true,
      completed: true,
      User: {
        select: {
          username: true
        }
      }
    },
    orderBy: {
      completed: 'desc',
    }
  });

  // At the time of writing this, Prisma doesn't support multiple orderBy filters,
  //  so we'll have to resort to this. Src: https://stackoverflow.com/a/1129270
  benchmarks.sort((a, b) => b.WPM - a.WPM); // b - a for reverse sort

  // Make this compatible with the relevant benchmark type on the frontend.
  const actualBms = benchmarks.map((v) => {
    return {
      WPM: v.WPM,
      completed: v.completed,
      //elapsedTime: v.elapsedTime,
      username: v.User.username
    }; 
  });

  return res.json(actualBms);
});

router.get('/:username', async (req: Request, res: Response) => {
  const { username } = req.params;

  /*const user = await prisma.user.findUnique({
    where: { id: userId }
  });*/

  const benchmarks = await prisma.benchmark.findMany({
    take: 40, // Take the past (by 'desc') 40 typing benchmarks.
    where: { User: { username } },
    select: {
      completed: true, 
      elapsedTime: true,
      WPM: true
    },
    orderBy: {
      completed: 'desc'
    }
  });

  res.json(benchmarks);
});

export default router;
