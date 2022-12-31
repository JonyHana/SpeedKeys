import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import http from 'http';

const port = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json('index route');
});

app.get('/api/example', (req: Request, res: Response) => {
  res.status(200).json('example API endpoint');
});

wss.on('connection', (sock: WebSocket, req) => {
  //sock.id = 'unique_id_here_1234';

  sock.on('message', (message: RawData) => {
    console.log(`client sent: ${message}`);
    sock.send(JSON.stringify({ msg: `server received: ${message}` }));
  });

  sock.on('close', () => {
    console.log('a user disconnected');
  });
});

httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);

  /*io.on("connection", (socket: Socket) => {
    console.log(`connect ${socket.id}`);
    
    socket.on("disconnect", () => {
      console.log(`disconnect ${socket.id}`);
    });
  });*/
});
