import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Prices() {
  useEffect(() => {
    const socket = io("http://localhost:3001/prices");

    socket.on("connect", () => {
      socket.emit("message", { from: "client1", text: "hello" });
    });

    socket.on("message", (message) => {
      console.log("prices:", message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>prices</div>;
}
