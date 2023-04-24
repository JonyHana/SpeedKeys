import { T_CreateBenchmark } from "../typings/types";
import { prisma } from "../utils/db";

export async function getBenchmarks() {
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

  return actualBms;
}

export async function getUserBenchmarks(username: string) {
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

  return benchmarks;
}

export async function createBenchmark({ username, elapsedTime, WPM }: T_CreateBenchmark) {
  const user = await prisma.user.findUnique({
    where: { username }
  });

  await prisma.benchmark.create({
    data: {
      userId: user!.id,
      elapsedTime,
      WPM
    }
  });
}
