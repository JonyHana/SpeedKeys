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

// Passport has this already stored as a field in the request body but not sure how to expose the types for field.
//  So I'm making a duplicate for now, even though this a bad idea.
type AuthSession = {
  username: string;
}

declare module "express-session" {
  interface SessionData {
    randomVarTest?: string;
    game: GameSession | null;
    auth: AuthSession | null;
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
