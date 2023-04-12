import { useEffect, useState, useRef } from "react";

import TypeBox from "../components/TypeBox";

const TypePage = () => {
  const [sentence, setSentence] = useState<string>();
  const [countdown, setCountdown] = useState<number>(-1);
  const [timeLeft, setTimeLeft] = useState<number>(-1);
  const [gameOverWPM, setGameOverWPM] = useState<number>(-1);

  const socket = useRef<WebSocket | null>(null);
  const baseCursorIndexRef = useRef<number>(0);
  
  const [timeLeftInterval, setTimeLeftInterval] = useState<number | null>(null);

  useEffect(() => {
    if (typeof sentence === 'undefined') return;
    console.log('sentence provided: ' + sentence);
  }, [sentence]);

  useEffect(() => {
    if (countdown === -1) return;
    console.log('counting down: ' + countdown);
  }, [countdown]);

  // Note: This should only run once.
  // The server doesn't need to remind on timeleft, it's set every second on the client side.
  //  It'll let the user know when the game is over when the client sends 'progress' after game expiration,
  //   in which the server responds with 'game_over'.
  useEffect(() => {
    if (timeLeft === -1 || timeLeftInterval) return;

    console.log('time left: ' + timeLeft);

    setTimeLeftInterval(setInterval(sendProgress, 1000));
  }, [timeLeft]);
 
  useEffect(() => {
    if (socket.current !== null) return;

    // Reminder: Make sure to use wss:// instead of ws:// in production.
    socket.current = new WebSocket(`ws://localhost:${import.meta.env.VITE_API_PORT}`)

    socket.current.onopen = (event: Event) => {
      //console.log("[WebSocket] Connection established. Sending to server..");
      socket.current?.send(JSON.stringify({ event: 'starting' }));
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
        case 'game_over':
          gameFinished(data.wpm);
          break;
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

    // On component unmount. Main use is when the user leaves the page.
    return () => {
      closeSockConnection();
    }
  }, []);

  const gameFinished = (wpm: number) => {
    closeSockConnection();
    setGameOverWPM(wpm);
  }

  const closeSockConnection = () => {
    socket.current?.close();
    socket.current = null;
  }
  
  const sendProgress = () => {
    if (socket.current === null) {
      if (timeLeftInterval) {
        clearInterval(timeLeftInterval);
      }
      return;
    }

    setTimeLeft((prevValue) => prevValue - 1);

    console.log('send progress; baseCursorIndexRef.current = ', baseCursorIndexRef.current);
    socket.current.send(JSON.stringify({ event: 'progress', baseCursorIndex: baseCursorIndexRef.current }));
  }

  const renderGameStatus = () => {
    if (timeLeft >= 0) { 
      return (
        <span className="font-semibold text-lg">Time left: { timeLeft }</span>
      );
    }
    else {
      return (
        <span className="font-semibold text-lg">Starting in.. { countdown === -1 ? '' : countdown }</span>
      );
    }
  }

  const renderGameResults = () => {
    if (gameOverWPM !== -1) {
      return (
        <div className="font-semibold text-center">
          <h2 className="text-orange-400">Game Over!</h2>
          <h4>-- Results --</h4>
          <h4>WPM: {gameOverWPM}</h4>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="h-screen w-screen">
      <div className="grid h-screen place-items-center">
        <div className="flex flex-col align-middle justify-center place-items-center">
          { renderGameStatus() }
          
          {sentence &&
            <TypeBox sentence={sentence} disabled={timeLeft <= 0} baseCursorIndexRef={baseCursorIndexRef} />
          }
          
          { renderGameResults() }
        </div>

        <div className="text-2xl">
          Created by <a href="https://github.com/JonyHana" className="text-green-400">Jonathan Hana</a>
        </div>
      </div>
    </div>
  )
}

export default TypePage