import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { io } from "socket.io-client";

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const xterm = new Terminal({
      cursorBlink: true,
      rows: 24,
      cols: 80,
    });
    xtermRef.current = xterm;
    xterm.open(terminalRef.current);

    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    xterm.onData((data) => {
      console.log("This is data", data);
      socket.emit("input", data);
    });

    socket.on("output", (data) => {
      xterm.write(data);
    });

    xterm.writeln("Welcome to the terminal!");

    return () => {
      xterm.dispose();
      socket.disconnect();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default TerminalComponent;
