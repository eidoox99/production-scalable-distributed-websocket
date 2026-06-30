import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { clearToken, getToken } from "../lib/auth";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost";
const HEARTBEAT_MS = 30_000;

export default function Listen() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("disconnected");
  const [lastPong, setLastPong] = useState<string>("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    const socket: Socket = io(WS_URL, {
      auth: { token },
    });

    socket.on("connect", () => {
      setStatus(`connected: ${socket.id}`);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", (err) => {
      setStatus(`error: ${err.message}`);
    });

    socket.on("pong", () => {
      setLastPong(new Date().toLocaleTimeString());
    });

    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      }
    }, HEARTBEAT_MS);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [navigate]);

  function handleLogout() {
    clearToken();
    navigate("/auth");
  }

  return (
    <div>
      <h1>listen</h1>
      <p>{status}</p>
      <p>last pong: {lastPong || "none"}</p>
      <button type="button" onClick={handleLogout}>
        logout
      </button>
    </div>
  );
}
