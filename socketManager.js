const { Server } = require("socket.io");
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:8081",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
}

function getSocket() {
  if (!io) {
    throw new Error("Socket.io instance is not initialized");
  }
  return io;
}

module.exports = { initSocket, getSocket };
