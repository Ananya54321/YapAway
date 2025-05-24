import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

// let allSockets: WebSocket[] = [];
// its not preferable to use list for sockets
// better to use something like records or maps
// we need something like the below
//  let allSockets = {
//   "room1" : [socket1, socket2],
//   "room2" : [socket3, socket4]
//  }

// implementation using maps:
type socketRecord = Record<string, WebSocket[]>;
const allSockets: socketRecord = {};

// lets assume the object sent from the user is in the following way:
// for joining a room
// {
//   "type" : "join",
//   "payload" : {
//     "roomId" : "room1"
//   }
// }

// for chatting in a room
/* {
  "type" : "chat",
  "payload" : {
    "roomId" : "room1",
    "message" : "Hello"
  }
} */

wss.on("connection", (socket) => {
  // allSockets.push(socket);
  console.log("client connected");

  socket.on("message", (msg) => {
    // only strings can be passed in sockets
    // so we can use JSON.parse and JSON.stringify whenever necessary
    // first lets parse the message from string to json
    const parsedmsg = JSON.parse(msg.toLocaleString());
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
      console.log(allSockets);
      
      // Notify other users in the room that someone joined
      allSockets[roomId].forEach((s) => {
        if (s !== socket) { // Don't send notification back to joining user
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
      allSockets[roomId].forEach((s) => {
        // Send a JSON object with message and sender info instead of just the message
        s.send(JSON.stringify({
          message: parsedmsg.payload.message,
          username: parsedmsg.payload.username || 'anonymous',
          senderId: parsedmsg.payload.senderId || null
        }));
      });
    }

    // console.log("received: ", msg.toLocaleString());
    // allSockets.forEach((s) => {
    //   s.send(msg.toLocaleString());
    // });
  });

  // Store user information for this socket
  const socketInfo: { roomId?: string, username?: string } = {};
  
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
          s.send(JSON.stringify({
            message: `${username} has left the room`,
            username: "system",
            isSystemMessage: true
          }));
        });
      }
    }
  });
});
