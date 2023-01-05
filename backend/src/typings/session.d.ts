import "express-session";

type GameSession = {
  status: 'init' | 'starting' | 'progress';
  progress?: 0;
  countdown?: 0;
};

declare module "express-session" {
  interface SessionData {
    randomVarTest: string;
    game: GameSession;
  }
}
