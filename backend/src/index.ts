import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import http from 'http';
import session from 'express-session';

const port = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);

const wss = new WebSocketServer({
  // 'noServer' instead of setting httpServer to 'server' since we must have a manual upgrade on the httpServer to process express-session, using sessionParser.
  noServer: true,
});

const sessionParser = session({
  secret: process.env.SESSION_SECRET_KEY,
  // cookie: {
  //   maxAge: 365 * 24 * 60 * 60,
  //   secure: (process.env.NODE_ENV === 'production'),
  //   sameSite: 'strict', //(process.env.NODE_ENV === 'production' ? 'none' : 'lax')
  // },
  
  resave: false,
  saveUninitialized: false
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
  res.status(200).json(req.session);
});

wss.on('connection', (sock: WebSocket, req: Request) => {
  //sock.id = 'unique_id_here_1234'; // NOTE: use req.session.game.id instead (using express-session).
  console.log(`[ws] new user has connected: ${req.sessionID}`);

  sock.on('message', (message: RawData) => {
    const gameEvent = message.toString();

    console.log(`[ws] ${req.sessionID} sent: ${gameEvent}`);

    if (gameEvent === 'init') {
      // if (req.session.game.status !== 'init') return;
      //req.session.game.progress = 0;
      
      // DEBUG: send a REST request while this is happening to see if I'm getting a response or if this completely blocks thread.
      //  NOTE: this gets called multiple times if a user refreshes or a new user joins.
      /*let counter = 10;
      wss.clients.forEach(c => c.send('counting down from 10..'));
      let WinnerCountdown = setInterval(function(){
        //io.sockets.emit('counter', counter);
        wss.clients.forEach(c => c.send(counter));
        counter--;
        if (counter === 0) {
          //io.sockets.emit('counter', "Congratulations You WON!!");
          wss.clients.forEach(c => c.send('congrats! counter is now 0'));
          clearInterval(WinnerCountdown);
        }
      }, 1000);*/
    }
    else if (gameEvent === 'progress') {
      //req.session.game.progress++;
    }

    sock.send('[ws] ok');
  });

  sock.on('close', () => {
    console.log(`[ws] user has disconnected: ${req.sessionID}`);
  });
});

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});
