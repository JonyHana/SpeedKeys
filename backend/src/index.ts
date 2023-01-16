import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import http from 'http';
import session from 'express-session';
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
  cookie: {
    maxAge: (365 * 24 * 60 * 60) * 1000,
    secure: (process.env.NODE_ENV === 'production'),
    sameSite: 'strict', //(process.env.NODE_ENV === 'production' ? 'none' : 'lax')
  },
  resave: false,
  saveUninitialized: false
});

const TIME_LEFT = 30;
const DATE_OBJ = new Date();

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

wss.on('connection', (sock: WebSocket, req: Request) => {
  console.log(`[ws] new user has connected: ${req.sessionID}`);
  console.log(req.session);

  req.session.game = {
    status: 'init'
  };

  const sentence = sentenceGenerator();
  
  // (RESUME)
  const EndGame = () => {
    req.session.game = null;
  }
  
  sock.on('message', (message: RawData) => {
    if (!req.session.game) {
      console.log(`[ws] ERR: req.session.game doesn\'t exist for ${req.sessionID}`);
      //sock.send('error_init');
      return;
    }
    
    if (
      req.session.game.expire &&
      req.session.game.expire < DATE_OBJ.getTime()
    ) {
      console.log(`[ws] game expired: ${DATE_OBJ.getTime() - req.session.game.expire} seconds old`);
      EndGame();
      return;
    }

    const gameEvent = message.toString();

    console.log(`[ws] ${req.sessionID} sent: ${gameEvent}`);

    if (gameEvent === 'starting') {
      if (req.session.game.status !== 'init') return;
      
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
          //console.log(`countdown for ${req.sessionID}\nreadyState: ${sock.readyState}\n`);
          //sock.send('cd=' + counter);
          sock.send(JSON.stringify({ event: 'countdown', countdown: counter }));

          if (counter === 0) {
            clearInterval(gameCountdown);

            if (req.session.game) {
              req.session.game.expire = (new Date()).getTime() + (1000 * TIME_LEFT);
              sock.send(JSON.stringify({ event: 'start', timeLeft: TIME_LEFT }));
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
          //console.log(`sock closed for ${req.sessionID}, clear countdown.`);
          clearInterval(gameCountdown);
        }
      }, 1000);
    }
    else if (gameEvent === 'progress') {
      if (req.session.game.progress) {
        req.session.game.progress++;
        //sock.send(JSON.stringify({ event: 'progress' }));
      }
      /*else {
        sock.send('error_progress');
      }*/
    }
  });

  sock.on('close', () => {
    console.log(`[ws] user has disconnected: ${req.sessionID}`);
    EndGame();
  });
});

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});
