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
      if (!allSockets[roomId]) {
        allSockets[roomId] = [];
      }
      allSockets[roomId].push(socket);
      console.log(allSockets);
    }

    if (parsedmsg.type === "chat") {
      const roomId = parsedmsg.payload.roomId;
      allSockets[roomId].forEach((s) => {
        s.send(parsedmsg.payload.message);
      });
    }

    // console.log("received: ", msg.toLocaleString());
    // allSockets.forEach((s) => {
    //   s.send(msg.toLocaleString());
    // });
  });

  socket.on("disconnect", () => {
    // allSockets = allSockets.filter((s) => s != socket);
    // the sockets which have been disconnected are removed from the allSockets array
  });
});
