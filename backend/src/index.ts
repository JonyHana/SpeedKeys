require('dotenv').config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import session, { MemoryStore } from 'express-session';

import authMiddleware from './middleware/passport';
import userRoute from './routes/userRoute';
import benchmarksRoute from './routes/benchmarksRoute';

import { InitTypeGameServer } from './typegame';
import { RedisClientType, createClient } from 'redis';
import RedisStore from 'connect-redis';

const port = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);

const wss = new WebSocketServer({
  // 'noServer' instead of setting httpServer to 'server' since we must have a manual upgrade on the httpServer to process express-session, using sessionParser.
  noServer: true,
});

let redisClient: RedisClientType | null = null;
if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient
    .connect()
    .catch((e) => {
      console.log('[Redis Error] -> ', e);
      redisClient?.disconnect();
      redisClient = null;
    })
    .finally(() => {
      if (redisClient === null) {
        throw new Error('Error occured while connecting to Redis. Exiting..');
      }
      else {
        console.log('Connected to Redis @ ', process.env.REDIS_URL);
      }
    });
}

const sessionParser = session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false, // Don't save session if unmodified.
  saveUninitialized: false, // Don't create session until something stored.
  store: (
    !redisClient
    ? new MemoryStore()
    : new RedisStore({
      client: redisClient,
      prefix: "myapp:"
    })
  ),
  proxy: process.env.NODE_ENV === 'production',
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
app.use('/benchmarks', benchmarksRoute);

InitTypeGameServer(wss);

app.get('/', (req: Request, res: Response) => {
  const authedSession = req.session.passport;
  //console.log('GET / ->', authedSession);
  if (authedSession) {
    res.json({ username: authedSession.user.username });
  }
  else {
    res.json({ error: 'Not logged in.' });
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
