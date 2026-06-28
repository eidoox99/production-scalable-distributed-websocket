import "@pkg/shared";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import {
  addRoomToConnection,
  getRedis,
  refreshConnectionHeartbeat,
  registerConnection,
  removeConnection,
} from "@pkg/shared";
import { socketAuthMiddleware } from "./auth.js";

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
const GATEWAY_ID = process.env.GATEWAY_ID ?? "gateway_default";

app.get("/health", (_req, res) => {
  res.json({ status: "ok", gatewayId: GATEWAY_ID });
});

io.on("connection", async (socket) => {
  const { userId } = socket.data;

  await registerConnection(userId, socket.id, GATEWAY_ID);
  console.log("client connected:", socket.id, "userId:", userId, "gateway:", GATEWAY_ID);

  socket.on("join-room", async (roomId: string) => {
    if (!roomId) return;
    socket.join(roomId);
    await addRoomToConnection(userId, roomId);
    console.log("socket joined room:", socket.id, roomId);
  });

  socket.on("ping", async () => {
    const ok = await refreshConnectionHeartbeat(userId);
    if (ok) {
      socket.emit("pong");
    } else {
      socket.disconnect(true);
    }
  });

  socket.on("disconnect", async () => {
    await removeConnection(userId, socket.id);
    console.log("client disconnected:", socket.id, "userId:", userId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`ws-gateway [${GATEWAY_ID}] listening on ${PORT}`);
});
