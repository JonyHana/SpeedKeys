import "express-session";

type GameSession = {
  status: 'init' | 'starting' | 'progress';
  progress?: number;
  countdown?: number;
  WPM?: number;
  expire?: number;
};

declare module "express-session" {
  interface SessionData {
    randomVarTest?: string;
    game: GameSession | null;
  }
}
