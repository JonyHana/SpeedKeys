import { MouseEvent, useEffect, useRef, ChangeEvent, useState } from "react";
import { Link } from "react-router-dom";

const SocketTest = () => {
  const socket = useRef<WebSocket | null>(null);
  const [msgFieldEvent, setMsgFieldEvent] = useState<string>('init');
  //const [msgFieldActions, setMsgFieldActions] = useState<string>('');

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    try {
      /*socket.current?.send(
        JSON.stringify({
          event: msgFieldEvent,
          actions: JSON.parse(msgFieldActions)
        })
      );*/
      socket.current?.send(msgFieldEvent);
    }
    catch (e) {
      console.log('[ws] send error: ', e);
      throw e;
    }
  }
  
  /*const handleChange_MsgEvent = (e: ChangeEvent<HTMLInputElement>) => {
    setMsgEvent(e.target.value);
  }
  const handleChange_MsgActions(e: ChangeEvent<HTMLTextAreaElement>) => {
    setMsgActions(e.target.value);
  }*/
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'event') { // event field
      setMsgFieldEvent(e.target.value);
    }
    /*else { // actions field
      setMsgFieldActions(e.target.value);
    }*/
  }

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
        console.log("[WebSocket] Connection established. Sending to server..");
        //socket.current?.send(JSON.stringify({ event: "init__debug", actions: {} }));
        socket.current?.send(msgFieldEvent);
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

  return (
    <div className="m-4">
      <h1 className="my-2 font-semibold text-4xl text-blue-600">Press the button to send a msg to the WebSocketServer.</h1>
      <input name='event' type="text" placeholder="Insert Msg Event Field Here" value={msgFieldEvent} onChange={handleChange}></input>
      <button className="p-1.5 rounded-sm font-semibold text-white bg-lime-700" onClick={handleClick}>Send Message</button>
      <Link to='/' className="p-1.5 rounded-sm font-semibold text-white bg-blue-700">Home Page</Link>
    </div>
  )
}

export default SocketTest