/**
 * @fileoverview TerminalPanel component.
 * Provides a secure WebSocket-connected terminal interface using xterm.js.
 * Features:
 * - Firebase authentication for secure access
 * - WebSocket connection with reconnection logic
 * - Input buffering and command handling
 * - Responsive resizing with xterm's FitAddon
 * - Connection status display with Material UI
 *
 * Works both locally (ws://localhost:4000) and in production (wss://backend-host).
 *
 * @module components/TerminalPanel
 */

import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { Paper, Box, Typography, Divider, Chip } from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserToken } from "../utils/userToken.js";

const TerminalPanel = ({ projectId = "default", wsPath = "/terminal-audit", active = false }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const inputBufferRef = useRef("");
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      convertEol: true,
      theme: {
        background: "#1e1e1e",
        foreground: "#cccccc",
        cursor: "#cccccc",
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    termRef.current = term;
    fitRef.current = fitAddon;

    if (terminalRef.current) {
      term.open(terminalRef.current);
      requestAnimationFrame(() => fitAddon.fit());
      term.focus();
    }

    term.onData((data) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        if (data !== "\r") {
          inputBufferRef.current += data;
          term.write(data);
        } else {
          term.write("\r\n");
          inputBufferRef.current = "";
        }
        return;
      }

      if (data === "\r") {
        socket.send(inputBufferRef.current + "\n");
        inputBufferRef.current = "";
        term.write("\r\n");
      } else if (data === "\u007F") {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          term.write("\b \b");
        }
      } else {
        inputBufferRef.current += data;
        term.write(data);
      }
    });

    const handleResize = () => {
      if (fitRef.current) fitRef.current.fit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) socketRef.current.close();
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (active && fitRef.current) {
      requestAnimationFrame(() => fitRef.current.fit());
    }
  }, [active]);

  useEffect(() => {
    let unsubAuth = null;

    const connect = async () => {
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
      }

      setStatus("connecting");

      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const backendHost = import.meta.env.VITE_BACKEND_WS_HOST || "localhost:4000";

      const token = await getUserToken(true).catch(() => null);
      const url = `${protocol}://${backendHost}${wsPath}?project=${encodeURIComponent(
        projectId
      )}&token=${encodeURIComponent(token || "")}`;

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("connected");
        inputBufferRef.current = "";
        if (fitRef.current) fitRef.current.fit();
        termRef.current?.writeln("\x1b[32m✅ Connected to server\x1b[0m");
      };

      socket.onmessage = (event) => {
        if (termRef.current) termRef.current.write(event.data);
      };

      socket.onerror = () => setStatus("error");

      socket.onclose = () => {
        setStatus("disconnected");
        socketRef.current = null;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };
    };

    const auth = getAuth();
    unsubAuth = onAuthStateChanged(auth, async () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) socketRef.current.close();
      connect();
    });

    const interval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send("__ping__");
      }
    }, 25000);

    return () => {
      if (unsubAuth) unsubAuth();
      clearInterval(interval);
    };
  }, [projectId, wsPath]);

  return (
    <Paper elevation={3} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1 }}>
        <Typography variant="subtitle1">💻 Terminal</Typography>
        <Chip
          label={status}
          color={status === "connected" ? "success" : status === "error" ? "error" : "warning"}
          size="small"
        />
      </Box>
      <Divider />
      <Box
        ref={terminalRef}
        sx={{ flex: 1, minHeight: "300px", bgcolor: "#1e1e1e", overflow: "hidden" }}
      />
    </Paper>
  );
};

export default TerminalPanel;
