import { loadEnv } from "./env.js";

loadEnv();

export { loadEnv } from "./env.js";
export { getRedis, closeRedis } from "./redis.js";
export {
  signAccessToken,
  verifyAccessToken,
  jwt,
  type AccessTokenPayload,
  type JwtPayload,
  type SignOptions,
} from "./jwt.js";
export {
  CONN_TTL_SECONDS,
  HEARTBEAT_INTERVAL_SECONDS,
  registerConnection,
  refreshConnectionHeartbeat,
  addRoomToConnection,
  removeConnection,
  getConnection,
  type ConnectionRecord,
} from "./connectionRegistry.js";
export { Redis } from "ioredis";
