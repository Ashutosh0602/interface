const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const AsyncLock = require("async-lock");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

let codeState = "";
const lock = new AsyncLock();

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send the current code state to the newly connected client
  socket.emit("codeUpdate", codeState);

  // Listen for code changes from clients
  socket.on("codeChange", (newCode) => {
    // Acquire a lock before changing the code state
    lock.acquire("codeLock", (done) => {
      codeState = newCode;
      // Broadcast the new code to all clients except the sender
      socket.broadcast.emit("codeUpdate", newCode);
      done();
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
