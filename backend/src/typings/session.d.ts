import { Prisma } from "@prisma/client";
import "express-session";
import { WebSocket } from 'ws';

type GameSession = {
  status: 'init' | 'starting' | 'progress';
  progress?: number;
  countdown?: number;
  startTime?: number;
  expire?: number;
  socket?: WebSocket;
};

export type AuthSession = {
  username: string;
}

declare module "express-session" {
  interface SessionData {
    randomVarTest?: string;
    game: GameSession | null;
  }
}
