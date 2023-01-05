import "express-session";

type GameSession = {
  status: 'init' | 'progress';
};

declare module "express-session" {
  interface SessionData {
    randomVarTest: string;
    game: GameSession;
  }
}
