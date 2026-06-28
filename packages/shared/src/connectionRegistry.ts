import { getRedis } from "./redis.js";

export const CONN_TTL_SECONDS = 60;
export const HEARTBEAT_INTERVAL_SECONDS = 30;

export type ConnectionRecord = {
  gatewayId: string;
  lastHeartbeat: number;
  rooms: string[];
  socketId: string;
};

function connKey(userId: string): string {
  return `conn:${userId}`;
}

function parseRecord(raw: string): ConnectionRecord {
  return JSON.parse(raw) as ConnectionRecord;
}

export async function registerConnection(
  userId: string,
  socketId: string,
  gatewayId: string
): Promise<void> {
  const redis = getRedis();
  const record: ConnectionRecord = {
    gatewayId,
    lastHeartbeat: Date.now(),
    rooms: [],
    socketId,
  };
  await redis.set(connKey(userId), JSON.stringify(record), "EX", CONN_TTL_SECONDS);
}

export async function refreshConnectionHeartbeat(userId: string): Promise<boolean> {
  const redis = getRedis();
  const key = connKey(userId);
  const raw = await redis.get(key);

  if (!raw) {
    return false;
  }

  const record = parseRecord(raw);
  record.lastHeartbeat = Date.now();
  await redis.set(key, JSON.stringify(record), "EX", CONN_TTL_SECONDS);
  return true;
}

export async function addRoomToConnection(userId: string, roomId: string): Promise<void> {
  const redis = getRedis();
  const key = connKey(userId);
  const raw = await redis.get(key);

  if (!raw) {
    return;
  }

  const record = parseRecord(raw);
  if (!record.rooms.includes(roomId)) {
    record.rooms.push(roomId);
  }
  record.lastHeartbeat = Date.now();
  await redis.set(key, JSON.stringify(record), "EX", CONN_TTL_SECONDS);
}

export async function removeConnection(userId: string, socketId: string): Promise<void> {
  const redis = getRedis();
  const raw = await redis.get(connKey(userId));

  if (!raw) {
    return;
  }

  const record = parseRecord(raw);
  if (record.socketId === socketId) {
    await redis.del(connKey(userId));
  }
}

export async function getConnection(userId: string): Promise<ConnectionRecord | null> {
  const redis = getRedis();
  const raw = await redis.get(connKey(userId));
  return raw ? parseRecord(raw) : null;
}
