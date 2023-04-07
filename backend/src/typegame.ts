import { Request } from 'express';
import { WebSocket, RawData } from 'ws';
import sentenceGenerator from './utils/sentenceGenerator';

const TIME_LEFT = 60;

const endGame = (req: Express.Request, numOfWords?: number) => {
  if (!req.session.game) return;

  if (numOfWords) {
    const timestamp = (new Date()).getTime();
    const progress = req.session.game.progress as number;
    const startTime = req.session.game.startTime as number;

    // https://www.speedtypingonline.com/typing-equations
    //  Note: The reason for 5 as mentioned in the source above could be because "The average word length in English language is 4.7".
    const calculateWPM = Math.round((progress / 5) / ((timestamp - startTime) / 1000 / 60));
    console.log('endGame -> user finished with calculatedWPM = ', calculateWPM);

    req.session.game.socket?.send(JSON.stringify({ event: 'game_over', wpm: calculateWPM }));
  }

  req.session.game.socket?.close();
  req.session.game = null;
}

const isValidMessage = (req: Express.Request) => {
  if (!req.session.game) {
    return false;
  }

  const timestamp = new Date().getTime();

  /*console.log(
    req.session.game.expire, timestamp,
    (req.session.game.expire ? req.session.game.expire - timestamp : -1)
  );*/

  if (
    req.session.game.expire &&
    req.session.game.expire < timestamp
  ) {
    console.log(`[ws] game expired: ${timestamp - req.session.game.expire} seconds old`);
    return false;
  }

  return true;
}

export function InitTypeGameServer(webSocketServer: any) {
  console.log('type game WebSocketServer loaded.');

  webSocketServer.on('connection', (sock: WebSocket, req: Request) => {
    console.log(`[ws] new user has connected: ${req.sessionID}`);

    req.session.game = {
      status: 'init'
    };

    const sentence = sentenceGenerator();
    //console.log(`generated sentence of ${sentence.length} length: ${sentence}`);
    
    sock.on('message', (message: RawData) => {
      if (!isValidMessage(req)) {
        if (req.session.game) {
          endGame(req, sentence.length);
        }
        return;
      }

      const gameData = JSON.parse(message.toString());
      const gameEvent = gameData.event; 

      console.log(`[ws] ${req.sessionID} sent: ${gameEvent}`);
      //console.log(gameEvent, gameData);

      if (gameEvent === 'starting') {
        if (req.session.game?.status !== 'init') return;
        
        req.session.game = {
          status: 'starting',
          countdown: 0,
          progress: 0,
          startTime: 0,
          expire: 0,
          socket: sock
        };
        
        sock.send(JSON.stringify({ event: 'sentence', sentence }));
        
        let counter = 5;
        let gameCountdown = setInterval(() => {
          if (sock.readyState !== sock.CLOSED) {
            //console.log(`[ws] countdown for ${req.sessionID}\nreadyState: ${sock.readyState}\n`);
            sock.send(JSON.stringify({ event: 'countdown', countdown: counter }));

            if (counter === 0) {
              clearInterval(gameCountdown);

              if (req.session.game) {
                const startTime = (new Date()).getTime();
                req.session.game.startTime = startTime;
                req.session.game.expire = startTime + (1000 * TIME_LEFT);
                sock.send(JSON.stringify({ event: 'start', timeLeft: TIME_LEFT }));
                console.log(`[ws] game began for ${req.sessionID}`);
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
        console.log(gameData.baseCursorIndex, sentence.length);

        if (req.session.game?.progress !== undefined) {
          req.session.game.progress = gameData.baseCursorIndex as number;
          console.log(`[ws] (${req.sessionID}) req.session.game.progress = ${req.session.game.progress}`);
          if (req.session.game.progress - 1 === sentence.length) { // If progress - 1 is greater than sentence.length then the user is either tampering or game is bugged.
            console.log('user finished game before time expiration.');
            endGame(req, sentence.length);
          }
        }
        /*else { // This shouldn't ever happen unless user is tampering or game is bugged.
          sock.send('error_progress');
        }*/
      }
    });

    sock.on('close', () => {
      console.log(`[ws] user has disconnected: ${req.sessionID}`);
      endGame(req);
    });
  });
}
