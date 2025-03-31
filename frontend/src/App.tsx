import React, { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState(["hi there"]);
  const wsRef = useRef<WebSocket | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      setMessages((m) => [...m, event.data]);
    };
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "room1",
          },
        })
      );
    };
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        payload: {
          roomId: "room1",
          message: input,
        },
      })
    );
  };

  const handleOnChange = (e: any) => {
    setInput(e.target.value);
  };

  return (
    <>
      <div className="h-screen bg-black text-black">
        <div className="h-[95vh]">
          {messages.map((message) => (
            <div className=" flex flex-col rounded p-4">
              <span className="bg-white  p-4">{message}</span>
            </div>
          ))}
        </div>
        <div className="flex w-full bg-white p-4">
          <label htmlFor="chat">+</label>
          <input
            type="text"
            onChange={handleOnChange}
            className="flex-1"
            name="chat"
            id="chat"
          />
          <button
            type="submit"
            onClick={sendMessage}
            className="bg-purple-600 text-white">
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
