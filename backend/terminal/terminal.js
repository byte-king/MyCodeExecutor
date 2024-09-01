const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const pty = require("node-pty");
const cors = require("cors");

const app = express();
const port = process.env.TERMINAL_PORT || 3001;

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  const shell = pty.spawn("bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: "/usr/src/app",
    env: process.env,
  });

  shell.on("data", (data) => {
    socket.emit("output", data);
  });

  socket.on("input", (data) => {
    shell.write(data);
  });

  socket.on("resize", (cols, rows) => {
    shell.resize(cols, rows);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    shell.kill();
  });
});

server.listen(port, () => {
  console.log(`Terminal service running on http://localhost:${port}`);
});
