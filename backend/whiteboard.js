const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Class for each operation log
class OperationLog {
  constructor(type, data) {
    this.type = type; // draw, text, shape
    this.data = data; // { prevX, prevY, currX, currY, tool, color } for draw, { x, y, text, color } for text, { shape, startX, startY, endX, endY, color } for shape
    this.next = null; // Pointer to next log in linked list
  }
}

// Linked list to manage operation logs
class OperationLogLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  // Add a new log to the end of the linked list
  addLog(type, data) {
    const newLog = new OperationLog(type, data);
    if (!this.head) {
      this.head = newLog;
      this.tail = newLog;
    } else {
      this.tail.next = newLog;
      this.tail = newLog;
    }
  }

  // Get all logs as an array (for initialization)
  getAllLogs() {
    let current = this.head;
    const logs = [];
    while (current) {
      logs.push({ type: current.type, data: current.data });
      current = current.next;
    }
    return logs;
  }
}

const operationLogs = new OperationLogLinkedList();

io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit existing operation logs to the newly connected user
  socket.emit("init", operationLogs.getAllLogs());

  // Listen for drawing events
  socket.on("draw", (data) => {
    operationLogs.addLog("draw", data);
    socket.broadcast.emit("draw", data);
  });

  // Listen for text input events
  socket.on("text", (data) => {
    operationLogs.addLog("text", data);
    socket.broadcast.emit("text", data);
  });

  // Listen for shape events
  socket.on("shape", (data) => {
    operationLogs.addLog("shape", data);
    socket.broadcast.emit("shape", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(4000, () => {
  console.log("Listening on port 4000");
});
