import type { Socket } from "socket.io";
import { verifyAccessToken } from "@pkg/shared";

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  const authHeader = socket.handshake.headers.authorization;
  const token =
    socket.handshake.auth.token ??
    (typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined);

  if (!token) {
    next(new Error("unauthorized"));
    return;
  }

  try {
    const user = verifyAccessToken(token);
    socket.data.userId = user.userId;
    socket.data.email = user.email;
    next();
  } catch {
    next(new Error("unauthorized"));
  }
}
