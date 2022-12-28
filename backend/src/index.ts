import 'dotenv/config';

import express, { Request, Response } from 'express';
import { Socket, Server } from "socket.io";
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.status(200).json('index page');
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);

  io.on("connection", (socket: Socket) => {
    console.log(`connect ${socket.id}`);
    
    socket.on("disconnect", () => {
      console.log(`disconnect ${socket.id}`);
    });
  });
});
