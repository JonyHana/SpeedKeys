import { useEffect, useState, useRef } from "react";

import TypeBox from "../components/TypeBox";
import { T_UserBenchmark } from "../types";

const TypePage = () => {
  const [sentence, setSentence] = useState<string>();
  const [countdown, setCountdown] = useState<number>(-1);
  const [timeLeft, setTimeLeft] = useState<number>(-1);
  const [gameInfo, setGameInfo] = useState<T_UserBenchmark | null>(null);

  const socket = useRef<WebSocket | null>(null);
  const baseCursorIndexRef = useRef<number>(0);
  
  const [timeLeftInterval, setTimeLeftInterval] = useState<number | null>(null);

  useEffect(() => {
    if (typeof sentence === 'undefined') return;
    //console.log('sentence provided: ' + sentence);
  }, [sentence]);

  useEffect(() => {
    if (countdown === -1) return;
    //console.log('counting down: ' + countdown);
  }, [countdown]);

  // Note: This should only run once.
  // The server doesn't need to remind on timeleft, it's set every second on the client side.
  //  It'll let the user know when the game is over when the client sends 'progress' after game expiration,
  //   in which the server responds with 'game_over'.
  useEffect(() => {
    if (timeLeft === -1 || timeLeftInterval) return;

    //console.log('time left: ' + timeLeft);

    setTimeLeftInterval(setInterval(sendProgress, 1000));
  }, [timeLeft]);
 
  useEffect(() => {
    if (socket.current !== null) return;
    
    socket.current = new WebSocket(`${import.meta.env.VITE_API_WSS}`);

    socket.current.onopen = (event: Event) => {
      //console.log("[WebSocket] Connection established. Sending to server..");
      socket.current?.send(JSON.stringify({ event: 'starting' }));
    };
    
    socket.current.onmessage = (event: MessageEvent<string>) => {
      //console.log(`[WebSocket] Data received from server: ${event.data}`);
      
      const data = JSON.parse(event.data);
      //console.log('received event:', data.event);
      
      switch (data.event) {
        case 'sentence':
          setSentence(data.sentence);
          break;
        case 'countdown':
          setCountdown(data.countdown);
          break;
        case 'start':
          setTimeLeft(data.timeLeft);
          break;
        case 'game_over':
          gameFinished(data);
          break;
      }
    };
    
    socket.current.onclose = (event: CloseEvent) => { 
      socket.current = null;
    };

    // On component unmount. Main use is when the user leaves the page.
    // Note that Firefox has issues with this when in frontend dev mode,
    //  since React runs twice due to StrictMode.
    //  It gives a "websocket was interrupted while page is loading" error.
    return () => {
      closeSockConnection();
    }
  }, []);

  const gameFinished = (data: T_UserBenchmark) => {
    closeSockConnection();
    //setGameOverWPM(wpm);
    setGameInfo(data);
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

    //console.log('send progress; baseCursorIndexRef.current = ', baseCursorIndexRef.current);
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

  const refreshPage = () => {
    window.location.href = '/practice';
  }

  const renderGameResults = () => {
    if (gameInfo !== null) {
      return (
        <div className="font-semibold text-center">
          <h2 className="text-orange-400">Game Over!</h2>
          <h4>-- Results --</h4>
          <h4>Words Per Minute: {gameInfo.WPM}</h4>
          <h4>Elapsed Time (sec): {gameInfo.elapsedTime}</h4>

          <button
            className="p-1.5 m-2 rounded-sm font-semibold text-white bg-lime-700"
            onClick={refreshPage}
          >
            Replay?
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] w-full place-items-center justify-center">
      <div className="flex flex-col place-items-center">
        { renderGameStatus() }
        
        {sentence &&
          <TypeBox sentence={sentence} disabled={timeLeft <= 0} baseCursorIndexRef={baseCursorIndexRef} />
        }
        
        { renderGameResults() }
      </div>
    </div>
  )
}

export default TypePage