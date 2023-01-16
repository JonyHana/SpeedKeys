import { useEffect, useState, useRef } from "react";

import TypeBox from "../TypeBox";

const TypePage = () => {
  const [sentence, setSentence] = useState<string>();
  const [countdown, setCountdown] = useState<number>();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    //if (typeof sentence === 'undefined') return;
    console.log('sentence provided: ' + sentence);
  }, [sentence]);

  useEffect(() => {
    //if (typeof countdown === 'undefined') return;
    console.log('counting down: ' + countdown);
  }, [countdown]);

  useEffect(() => {
    //if (typeof timeLeft === 'undefined') return;
    console.log('time left: ' + timeLeft);
  }, [timeLeft]);
  
  useEffect(() => {
    if (socket.current !== null) { // on component unmount
      return (() => {
        socket.current?.close();
        socket.current = null;
      });
    }
    else { // on component mount
      socket.current = new WebSocket('ws://localhost:8080') // NOTE: make sure to use wss:// instead of ws:// in production

      socket.current.onopen = (event: Event) => {
        //console.log("[WebSocket] Connection established. Sending to server..");
        socket.current?.send('starting');
      };
      
      socket.current.onmessage = (event: MessageEvent<string>) => {
        //console.log(`[WebSocket] Data received from server: ${event.data}`);
        
        const data = JSON.parse(event.data);
        console.log('received event:', data.event);
        
        switch (data.event) {
          case 'sentence':
            setSentence(data.sentence);
            break;
          case 'countdown':
            setCountdown(data.countdown);
            break;
          case 'start':
            console.log(data);
            setTimeLeft(data.timeLeft);
            break;
          /*case 'progress':
            break;*/
        }
      };
      
      socket.current.onclose = (event: CloseEvent) => {
        /*if (event.wasClean) {
          console.log(`[WebSocket] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          console.log('[WebSocket] Connection died');
        }*/
        
        socket.current = null;
      };
      
      /*socket.current.onerror = (event: Event) => {
        console.log('[WebSocket] error');
      };*/
    }
  }, []);

  return (
    <div className="h-screen w-screen">
      <div className="grid h-screen place-items-center">
        {sentence &&
          <TypeBox sentence={sentence} enabled={timeLeft > 0} />
        }
        <div className="text-white text-2xl">
          Created by <span className="text-green-400">Jonathan Hana</span>
        </div>
      </div>
    </div>
  )
}

export default TypePage