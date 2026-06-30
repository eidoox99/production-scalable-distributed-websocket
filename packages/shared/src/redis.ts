import { Redis } from "ioredis";

let redis: Redis | null = null;

function attachRedisErrorHandler(client: Redis, label: string): Redis {
  client.on("error", (err) => {
    console.error(`[redis:${label}]`, err.message);
  });
  return client;
}

function createRedisClient(label: string): Redis {
  return attachRedisErrorHandler(
    new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    }),
    label
  );
}

export function getRedis(): Redis {
  if (!redis) {
    redis = createRedisClient("main");
  }
  return redis;
}

export function createRedisDuplicate(label: string): Redis {
  return createRedisClient(label);
}

export async function ensureRedis(): Promise<void> {
  const client = getRedis();
  await client.ping();
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
