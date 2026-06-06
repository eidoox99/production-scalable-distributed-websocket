import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Positions() {
  useEffect(() => {
    const socket = io("http://localhost:3001/positions");

    socket.on("connect", () => {
      socket.emit("message", { from: "client1", text: "hello" });
    });

    socket.on("message", (message) => {
      console.log("positions:", message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>positions</div>;
}
