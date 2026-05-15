import redisConnection from "../config/redis.js";
import logger from "../config/logger.js";

const memoryCache = new Map();

const now = () => Date.now();

const getMemoryValue = (key) => {
  const cached = memoryCache.get(key);

  if (!cached) return null;

  if (cached.expiresAt <= now()) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value;
};

const setMemoryValue = (key, value, ttlSeconds) => {
  memoryCache.set(key, {
    value,
    expiresAt: now() + ttlSeconds * 1000,
  });
};

export const getCachedJson = async (key) => {
  const memoryValue = getMemoryValue(key);
  if (memoryValue !== null) return memoryValue;

  if (!redisConnection) return null;

  try {
    if (redisConnection.status === "wait") {
      await redisConnection.connect();
    }

    const raw = await redisConnection.get(key);
    if (!raw) return null;

    const value = JSON.parse(raw);
    setMemoryValue(key, value, 30);
    return value;
  } catch (error) {
    logger.warn("Cache read failed", { key, error: error.message });
    return null;
  }
};

export const setCachedJson = async (key, value, ttlSeconds) => {
  setMemoryValue(key, value, ttlSeconds);

  if (!redisConnection) return;

  try {
    if (redisConnection.status === "wait") {
      await redisConnection.connect();
    }

    await redisConnection.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    logger.warn("Cache write failed", { key, error: error.message });
  }
};

export const deleteCacheByPrefix = async (prefix) => {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  if (!redisConnection) return;

  try {
    if (redisConnection.status === "wait") {
      await redisConnection.connect();
    }

    let cursor = "0";
    do {
      const [nextCursor, keys] = await redisConnection.scan(
        cursor,
        "MATCH",
        `${prefix}*`,
        "COUNT",
        100,
      );
      cursor = nextCursor;

      if (keys.length) {
        await redisConnection.del(keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    logger.warn("Cache invalidation failed", { prefix, error: error.message });
  }
};
