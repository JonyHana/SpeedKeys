require('dotenv').config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import http from 'http';
import session, { MemoryStore } from 'express-session';
import sentenceGenerator from './utils/sentenceGenerator';

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

const TIME_LEFT = 10;

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

app.use(sessionParser);

app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json('index route');
});

app.get('/api/example', (req: Request, res: Response) => {
  res.status(200).json('example API endpoint');
});

app.get('/api/debugsession', (req: Request, res: Response) => {
  req.session.randomVarTest = (!req.session.randomVarTest ? 'test123' : undefined);
  console.log(req.sessionID, req.session);
  res.status(200).json(req.session);
});

const endGame = (req: Express.Request) => {
  req.session.game = null;
}

const isValidMessage = (req: Express.Request) => {
  if (!req.session.game) {
    return false;
  }

  const timestamp = new Date().getTime();

  console.log(
    req.session.game.expire, timestamp,
    (req.session.game.expire ? req.session.game.expire - timestamp : -1)
  );

  if (
    req.session.game.expire &&
    req.session.game.expire < timestamp
  ) {
    console.log(`[ws] game expired: ${timestamp - req.session.game.expire} seconds old`);
    endGame(req);
    return false;
  }

  return true;
}

wss.on('connection', (sock: WebSocket, req: Request) => {
  console.log(`[ws] new user has connected: ${req.sessionID}`);

  req.session.game = {
    status: 'init'
  };

  const sentence = sentenceGenerator();
  
  sock.on('message', (message: RawData) => {
    if (!isValidMessage(req)) return;

    const gameData = JSON.parse(message.toString());
    const gameEvent = gameData.event; //message.toString();

    console.log(`[ws] ${req.sessionID} sent: ${gameEvent}`);

    if (gameEvent === 'starting') {
      if (req.session.game?.status !== 'init') return;
      
      req.session.game = {
        status: 'starting',
        countdown: 0,
        progress: 0,
        WPM: 0,
        expire: 0,
      };
      
      //sock.send('sentence=' + sentence);
      sock.send(JSON.stringify({ event: 'sentence', sentence }));
      
      let counter = 5;
      let gameCountdown = setInterval(() => {
        if (sock.readyState !== sock.CLOSED) {
          //console.log(`[ws] countdown for ${req.sessionID}\nreadyState: ${sock.readyState}\n`);
          //sock.send('cd=' + counter);
          sock.send(JSON.stringify({ event: 'countdown', countdown: counter }));

          if (counter === 0) {
            clearInterval(gameCountdown);

            if (req.session.game) {
              req.session.game.expire = (new Date()).getTime() + (1000 * TIME_LEFT);
              sock.send(JSON.stringify({ event: 'start', timeLeft: TIME_LEFT }));
              console.log(`[ws] game began for ${req.sessionID}`);
            }
            else { // this should never happen
              console.log('[ws] ERR: req.session.game === undefined');
            }
          }
          else {
            counter--;
          }
        }
        else {
          //console.log(`[ws] sock closed for ${req.sessionID}, clear countdown.`);
          clearInterval(gameCountdown);
        }
      }, 1000);
    }
    else if (gameEvent === 'progress') {
      if (req.session.game?.progress) {
        //if (gameData.baseCursorIndex > sentence.length) return; // User is probably tampering/cheating or game is bugged.
        req.session.game.progress = gameEvent.baseCursorIndex;
        console.log(`[ws] (${req.sessionID}) req.session.game.progress = ${req.session.game.progress}`);
      }
      /*else {
        sock.send('error_progress');
      }*/
    }
  });

  sock.on('close', () => {
    console.log(`[ws] user has disconnected: ${req.sessionID}`);
    endGame(req);
  });
});

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});
