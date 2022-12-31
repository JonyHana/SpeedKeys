import { MouseEvent, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const SocketTest = () => {
  const socket = useRef<WebSocket | null>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    socket.current?.send('User pressed send msg button.');
  }

  useEffect(() => {
    if (socket.current !== null) { // on component unmount
      return (() => {
        socket.current?.close();
        socket.current = null;
      });
    }
    else { // on component mount
      socket.current = new WebSocket("ws://localhost:8080") // NOTE: make sure to use wss:// instead of ws://
      
      socket.current.onopen = (event: Event) => {
        console.log("[WebSocket] Connection established. Sending to server..");
        socket.current?.send("Hello server, WebSocket client here.");
      };
    
      socket.current.onmessage = (event: MessageEvent<any>) => {
        console.log(`[WebSocket] Data received from server: ${event.data}`);
      };
    
      socket.current.onclose = (event: CloseEvent) => {
        if (event.wasClean) {
          console.log(`[WebSocket] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          console.log('[WebSocket] Connection died');
        }
    
        socket.current = null;
      };
    
      socket.current.onerror = (event: Event) => {
        console.log('[WebSocket] error');
      };
    }
  }, []);

  const [debugVal, setDebugVal] = useState<number>(0);

  return (
    <div className="m-4">
      <h1 className="my-2 font-semibold text-4xl text-blue-600">Press the button to send a msg to the WebSocketServer.</h1>
      <input type="text" placeholder="Insert Message Here"></input>
      <button className="p-1.5 rounded-sm font-semibold text-white bg-lime-700" onClick={handleClick}>Send Message</button>

      <button onClick={(()=>{setDebugVal(debugVal+1);console.log('pressed', debugVal);})}>Increase point</button>

      <Link to='/'>Home Page</Link>
    </div>
  )
}

export default SocketTest