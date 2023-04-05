import { useEffect, useState, useRef } from "react";

import TypeBox from "../components/TypeBox";

const TypePage = () => {
  const [sentence, setSentence] = useState<string>();
  const [countdown, setCountdown] = useState<number>(-1);
  const [timeLeft, setTimeLeft] = useState<number>(-1);
  const [displayInfoModal, setDisplayInfoModal] = useState<boolean>(false);
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
    socket.current = new WebSocket('ws://localhost:8080')

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
    console.log('wpm = ', wpm);
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
        <span className="text-white font-semibold text-lg">Time left: { timeLeft }</span>
      );
    }
    else {
      return (
        <span className="text-white font-semibold text-lg">Starting in.. { countdown === -1 ? '' : countdown }</span>
      );
    }
  }

  const renderInfoModal = () => {
    if (displayInfoModal) {
      // Modal source: https://flowbite.com/docs/components/modal/
      return (
        <>
          {/* <!-- Main modal --> */}
          <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full">
              <div className="relative w-full h-full max-w-2xl md:h-auto">
                  {/* <!-- Modal content --> */}
                  <div className="relative rounded-lg shadow bg-gray-700">
                      {/* <!-- Modal header --> */}
                      <div className="flex items-start justify-between p-4 border-b rounded-t border-gray-600">
                          <h3 className="text-xl font-semibold text-white">
                              Game Over!
                          </h3>
                          <button onClick={() => setDisplayInfoModal(false)} type="button" className="text-gray-400 bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600 hover:text-white">
                              <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                          </button>
                      </div>
                      {/* <!-- Modal body --> */}
                      <div className="p-6 space-y-6">
                          <p className="text-base leading-relaxed text-gray-200">
                            Your WPM: {gameOverWPM} 
                          </p>
                      </div>
                      {/* <!-- Modal footer --> */}
                      <div className="flex items-center p-6 space-x-2 border-t rounded-b border-gray-600">
                          <button type="button" className="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Save Score (for Guests)</button>
                      </div>
                  </div>
              </div>
          </div>
        </>
      );
    }
    return null;
  }

  return (
    <div className="h-screen w-screen">
      <div className="grid h-screen place-items-center">
        <div className="flex flex-col align-middle justify-center place-items-center">
          { renderGameStatus() }
          { renderInfoModal() }
          
          {sentence &&
            <TypeBox sentence={sentence} disabled={timeLeft <= 0} baseCursorIndexRef={baseCursorIndexRef} />
          }
        </div>

        <div className="text-white text-2xl">
          Created by <a href="https://github.com/JonyHana" className="text-green-400">Jonathan Hana</a>
        </div>
      </div>
    </div>
  )
}

export default TypePage