require('dotenv').config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import session, { MemoryStore } from 'express-session';

import authMiddleware from './middleware/passport';
import userRoute from './routes/userRoute';

import { InitTypeGameServer } from './typegame';
import { AuthSession } from './typings/session';

const port = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);

const wss = new WebSocketServer({
  // 'noServer' instead of setting httpServer to 'server' since we must have a manual upgrade on the httpServer to process express-session, using sessionParser.
  noServer: true,
});

const sessionParser = session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false, // Don't save session if unmodified.
  saveUninitialized: false, // Don't create session until something stored.
  store: new MemoryStore(), // Reminder: MemoryStore is NOT production ready!
  rolling: true, // Force the resetting of session identifier cookie. Expiration countdown set to original maxAge.
  cookie: {
    maxAge: 604800000, // 1 week; unit: ms // maxAge: (365 * 24 * 60 * 60) * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  }
});

// Parse the session on upgrade. This is necessary for req.session to exist when communicating via WebSocket, otherwise it will be undefined.
httpServer.on('upgrade', function (request: Request, socket, head) {  
  //request.res = {} as Response;

  sessionParser(request, {} as Response, () => {
    // //if (!request.session.userId) { // User would've had to login first so that session with userId (or any auth field, this is just an example) would've been initialized from there.
    // if (request.session.randomVarTest !== 'test123') {
    //   socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    //   socket.destroy();
    //   console.log('unauthorized');
    //   return;
    // }

    // Now the session is parsed.
    
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.use(sessionParser);
app.use(authMiddleware);

app.use('/user', userRoute);

InitTypeGameServer(wss);

app.get('/', (req: Request, res: Response) => {
  const user = req.user as AuthSession;
  //console.log('GET / -> ', req.user, user);
  if (user) {
    res.json(user);
  }
  else {
    res.json({ msg: 'Not logged in.' });
  }
});

// app.get('/api/debugsession', (req: Request, res: Response) => {
//   req.session.randomVarTest = (!req.session.randomVarTest ? 'test123' : undefined);
//   console.log(req.sessionID, req.session);
//   res.status(200).json(req.session);
// });

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});
