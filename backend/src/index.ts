import { WebSocketServer, WebSocket } from "ws";

// Use Render's dynamic port or fallback to 8080 for local development
const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });

type socketRecord = Record<string, WebSocket[]>;
const allSockets: socketRecord = {};

wss.on("connection", (socket) => {
  console.log("client connected");
  
  // Store user information for this socket - MOVED TO TOP
  const socketInfo: { roomId?: string, username?: string } = {};

  socket.on("message", (msg) => {
    try {
      const parsedmsg = JSON.parse(msg.toString());
      console.log(parsedmsg);

      if (parsedmsg.type === "join") {
        const roomId = parsedmsg.payload.roomId;
        const username = parsedmsg.payload.username || 'anonymous';
        
        // Store user information for disconnect handling
        socketInfo.roomId = roomId;
        socketInfo.username = username;
        
        // Create room if it doesn't exist
        if (!allSockets[roomId]) {
          allSockets[roomId] = [];
        }
        
        // Add socket to room
        allSockets[roomId].push(socket);
        console.log(`User ${username} joined room ${roomId}. Room size: ${allSockets[roomId].length}`);
        
        // Notify other users in the room that someone joined
        allSockets[roomId].forEach((s) => {
          if (s !== socket && s.readyState === WebSocket.OPEN) {
            s.send(JSON.stringify({
              message: `${username} has joined the room`,
              username: "system",
              isSystemMessage: true
            }));
          }
        });
      }

      if (parsedmsg.type === "chat") {
        const roomId = parsedmsg.payload.roomId;
        if (allSockets[roomId]) {
          allSockets[roomId].forEach((s) => {
            if (s.readyState === WebSocket.OPEN) {
              s.send(JSON.stringify({
                message: parsedmsg.payload.message,
                username: parsedmsg.payload.username || 'anonymous',
                senderId: parsedmsg.payload.senderId || null
              }));
            }
          });
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });
  
  socket.on("close", () => {
    // Handle socket disconnection and notify other users
    if (socketInfo.roomId && socketInfo.username) {
      const roomId = socketInfo.roomId;
      const username = socketInfo.username;
      
      // Remove this socket from the room
      if (allSockets[roomId]) {
        allSockets[roomId] = allSockets[roomId].filter(s => s !== socket);
        
        // Notify remaining users in the room that someone left
        allSockets[roomId].forEach((s) => {
          if (s.readyState === WebSocket.OPEN) {
            s.send(JSON.stringify({
              message: `${username} has left the room`,
              username: "system",
              isSystemMessage: true
            }));
          }
        });
        
        console.log(`User ${username} left room ${roomId}. Room size: ${allSockets[roomId].length}`);
      }
    }
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log(`WebSocket server starting on port ${PORT}`);
