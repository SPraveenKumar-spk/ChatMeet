const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "https://chatmeet-g1ux.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const corsOptions = {
  origin: "https://chatmeet-g1ux.onrender.com",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

let waitingQueue = [];
const activeConnections = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  if (activeConnections[socket.id]) {
    console.log("User already connected to a chat:", socket.id);
    socket.disconnect();
    return;
  }

  waitingQueue.push(socket);
  if (waitingQueue.length >= 2) {
    waitingQueue = shuffleArray(waitingQueue);
    const [user1, user2] = waitingQueue.splice(0, 2);
    const chatRoom = `room-${user1.id}-${user2.id}`;

    user1.join(chatRoom);
    user2.join(chatRoom);
    activeConnections[user1.id] = chatRoom;
    activeConnections[user2.id] = chatRoom;

    io.to(chatRoom).emit("connectedToChat", chatRoom);
    console.log(`Users ${user1.id} and ${user2.id} connected in ${chatRoom}`);
    user1.on("message", ({ room, text }) => {
      console.log(`Message from ${user1.id}: ${text}`);
      io.to(room).emit("message", { id: user1.id, text });
    });

    user2.on("message", ({ room, text }) => {
      console.log(`Message from ${user2.id}: ${text}`);
      io.to(room).emit("message", { id: user2.id, text });
    });
  }

  socket.on("offer", (data) => {
    const room = activeConnections[socket.id];
    if (room) {
      console.log("Sending offer to the room", room);
      socket.to(room).emit("offer", data);
    }
  });

  socket.on("answer", (data) => {
    const room = activeConnections[socket.id];
    if (room) {
      console.log("Sending answer to the room", room);
      socket.to(room).emit("answer", data);
    }
  });

  socket.on("ice-candidate", (data) => {
    const room = activeConnections[socket.id];
    if (room) {
      console.log("Sending ICE candidate to the room", room);
      socket.to(room).emit("ice-candidate", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const room = activeConnections[socket.id];
    if (room) {
      io.to(room).emit("message", {
        id: "system",
        text: "Stranger has been disconnected.",
      });
      socket.to(room).emit("peer-disconnected");

      console.log(`Room ${room} will be cleared`);

      const [user1Id, user2Id] = Object.keys(activeConnections).filter(
        (id) => activeConnections[id] === room
      );

      const otherUserId = user1Id === socket.id ? user2Id : user1Id;
      const otherSocket = io.sockets.sockets.get(otherUserId);

      if (otherSocket) {
        otherSocket.leave(room);
        delete activeConnections[otherUserId];
      }

      delete activeConnections[user1Id];
      delete activeConnections[user2Id];
    }
  });
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
