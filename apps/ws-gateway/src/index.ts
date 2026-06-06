import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const pricesNs = io.of("/prices");
const positionsNs = io.of("/positions");

const PORT = process.env.PORT ?? 3001;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});


pricesNs.on("connection", (socket) => {
    console.log("client connected to prices namespace:", socket.id);
    socket.emit("message", { from: "server", text: "hello prices" });

});

positionsNs.on("connection", (socket) => {
  console.log("client connected to positions namespace:", socket.id);

  socket.emit("message", { from: "server", text: "hello positions" });

});




httpServer.listen(PORT, () => {
  console.log(`ws-gateway listening on ${PORT}`);
});
