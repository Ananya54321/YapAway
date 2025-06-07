import React, { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  // State for storing all chat messages
  const [messages, setMessages] = useState<{text: string, sender: string}[]>([]);
  // WebSocket reference to maintain connection
  const wsRef = useRef<WebSocket | null>(null);
  // Input state for message typing
  const [messageInput, setMessageInput] = useState("");
  // Room ID state for joining different rooms
  const [roomId, setRoomId] = useState("room1");
  // Username state for identifying the sender
  const [username, setUsername] = useState("");
  // State to track if user has joined a room
  const [hasJoined, setHasJoined] = useState(false);
  // State to track connection status
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  // Reference to chat container for auto-scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Function to establish WebSocket connection
  const connectWebSocket = () => {
    // Create new WebSocket connection to backend server
    const ws = new WebSocket("wss://yapaway.onrender.com");
    wsRef.current = ws;

    // Handle incoming messages from the server
    ws.onmessage = (event) => {
      try {
        // Try to parse as JSON first
        const data = JSON.parse(event.data);
        
        // Check if this message is from the current client (sent by us)
        // If it is, don't add it again since we already added it when sending
        if (data.senderId === clientId.current) {
          // This is our own message coming back, so ignore it
          return;
        }
        
        // Handle system messages or regular user messages
        setMessages((prevMessages) => [
          ...prevMessages, 
          { 
            text: data.message || data, 
            sender: data.isSystemMessage ? "system" : data.username || "Unknown User" 
          }
        ]);
      } catch {
        // If not JSON, handle as plain text (fallback for compatibility)
        setMessages((prevMessages) => [
          ...prevMessages, 
          { text: event.data, sender: "Unknown User" }
        ]);
      }
    };

    // Handle WebSocket connection opened
    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
    };

    // Handle WebSocket connection closed
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus("disconnected");
      // Optional: Add reconnection logic here
    };

    // Handle WebSocket errors
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
    };
  };

  // Function to join a room
  const joinRoom = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    if (!roomId.trim()) {
      alert("Please enter a room ID");
      return;
    }

    // If not already connected, establish connection
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }

    // Once connected, join the specified room
    setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Send join message to server with client ID and username
        wsRef.current.send(
          JSON.stringify({
            type: "join",
            payload: {
              roomId: roomId,
              username: username,
              senderId: clientId.current // Include client ID for consistent identification
            },
          })
        );
        setHasJoined(true);
        // Add system message showing successful join
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `You joined room: ${roomId}`, sender: "system" }
        ]);
      }
    }, 500); // Small delay to ensure connection is established
  };

  // Generate a unique ID for this client instance
  const clientId = useRef(Math.random().toString(36).substring(2, 15));

  // Function to send a chat message
  const sendMessage = () => {
    if (!messageInput.trim() || !wsRef.current) return;

    // Send chat message to server with our unique client ID
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          roomId: roomId,
          message: messageInput,
          username: username,
          senderId: clientId.current // Add unique client ID to identify our messages
        },
      })
    );

    // Add the sent message to our local messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: messageInput, sender: "me" }
    ]);

    // Clear the input field after sending
    setMessageInput("");
  };

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Clean up WebSocket connection on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle pressing Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!hasJoined) {
        joinRoom();
      } else {
        sendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-pastel-light text-pastel-dark">
      {/* Header with connection status */}
      <div className="bg-pastel-primary p-4 flex justify-between items-center shadow-md">
        <h2 className="text-lg font-bold text-pastel-dark">YapAway</h2>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-pastel-success' : 
            connectionStatus === 'error' ? 'bg-pastel-danger' : 'bg-pastel-warning'
          }`}></div>
          <span className="text-sm">
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'error' ? 'Error' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {!hasJoined ? (
        // Room joining form (only shown before joining)
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-pastel-medium p-8 pastel-rounded shadow-lg w-96 pastel-shadow">
            <h2 className="text-2xl font-bold mb-6 text-center text-pastel-dark">Join a Chat Room</h2>
            <div className="mb-5">
              <label htmlFor="username" className="block mb-2 font-medium text-pastel-dark">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                className="w-full p-3 rounded-lg bg-pastel-light border border-pastel-primary focus:outline-none focus:ring-2 focus:ring-pastel-secondary"
              />
            </div>
            <div className="mb-7">
              <label htmlFor="roomId" className="block mb-2 font-medium text-pastel-dark">Room ID</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter room ID"
                className="w-full p-3 rounded-lg bg-pastel-light border border-pastel-primary focus:outline-none focus:ring-2 focus:ring-pastel-secondary"
              />
            </div>
            <button
              onClick={joinRoom}
              className="w-full bg-pastel-secondary hover:bg-pastel-primary text-pastel-dark p-3 rounded-lg font-medium transition duration-200"
            >
              Join Room
            </button>
          </div>
        </div>
      ) : (
        // Chat interface (shown after joining a room)
        <>
          {/* Room information bar */}
          <div className="bg-pastel-primary px-6 py-3 flex items-center border-b border-pastel-bg-medium">
            <div className="flex-1">
              <h2 className="font-medium text-pastel-dark">Room: {roomId}</h2>
              <p className="text-xs text-pastel-text-muted">Chatting as {username}</p>
            </div>
            <button 
              onClick={() => {
                // Notify server that user is leaving the room
                // Intentionally close and reopen the connection to trigger the close event
                if (wsRef.current) {
                  wsRef.current.close();
                }
                
                setHasJoined(false);
                setMessages([]);
                
                // Reset connection after a brief delay
                setTimeout(() => {
                  connectWebSocket();
                }, 500);
              }}
              className="text-sm bg-pastel-light hover:bg-pastel-danger text-pastel-text-dark px-4 py-2 rounded-lg transition duration-200"
            >
              Leave
            </button>
          </div>

          {/* Chat messages container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-pastel-bg-light"
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] pastel-message px-5 py-3 break-words ${
                    msg.sender === 'me' 
                      ? 'bg-pastel-secondary text-pastel-dark' 
                      : msg.sender === 'system'
                        ? 'bg-pastel-bg-medium text-pastel-text-muted italic text-center mx-auto'
                        : 'bg-pastel-primary text-pastel-dark'
                  }`}
                >
                  {msg.sender !== 'me' && msg.sender !== 'system' && (
                    <p className="text-xs font-semibold text-pastel-text-dark mb-1">{msg.sender}</p>
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-pastel-text-muted mt-10 p-8 bg-pastel-bg-medium rounded-lg">
                <p className="text-lg">No messages yet.</p>
                <p>Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message input area */}
          <div className="bg-pastel-medium p-5 border-t border-pastel-bg-medium">
            <div className="flex items-center">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-pastel-light border border-pastel-bg-medium rounded-l-lg px-4 py-3 focus:outline-none focus:border-pastel-secondary"
              />
              <button
                onClick={sendMessage}
                className="bg-pastel-secondary hover:bg-pastel-primary text-pastel-dark px-5 py-3 rounded-r-lg transition duration-200"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
