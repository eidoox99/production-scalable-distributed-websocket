import "@pkg/shared";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedis } from "@pkg/shared";
import { socketAuthMiddleware } from "./auth.js";
import {
  addRoomSocket,
  addUserSocket,
  removeSocket,
} from "./registry.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  },
});

const pubClient = getRedis();
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

io.use(socketAuthMiddleware);

const PORT = process.env.PORT ?? 3001;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  const { userId } = socket.data;

  addUserSocket(userId, socket.id);
  console.log("client connected:", socket.id, "userId:", userId);

  socket.on("join-room", (roomId: string) => {
    if (!roomId) return;
    socket.join(roomId);
    addRoomSocket(roomId, socket.id);
    console.log("socket joined room:", socket.id, roomId);
  });

  socket.on("disconnect", () => {
    removeSocket(socket.id, userId);
    console.log("client disconnected:", socket.id, "userId:", userId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`ws-gateway listening on ${PORT}`);
});
