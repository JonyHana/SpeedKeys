import "express-session";
import { WebSocket } from 'ws';

type GameSession = {
  status: 'init' | 'starting' | 'progress';
  progress?: number;
  countdown?: number;
  WPM?: number;
  expire?: number;
  socket?: WebSocket;
};

declare module "express-session" {
  interface SessionData {
    randomVarTest?: string;
    game: GameSession | null;
  }
}
