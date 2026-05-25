import crypto from "crypto";
import logger from "../../config/logger.js";
import { getRedisConnection } from "../../config/redis.js";

const memoryStore = new Map();
const lockReleaseScript = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

const now = () => Date.now();

const pruneExpiredMemoryEntries = () => {
  const currentTime = now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.expiresAt > 0 && value.expiresAt <= currentTime) {
      memoryStore.delete(key);
    }
  }
};

const withRedis = async (action, fallback) => {
  const redis = getRedisConnection();
  if (!redis) {
    return fallback();
  }

  try {
    if (redis.status === "wait") {
      await redis.connect();
    }

    return await action(redis);
  } catch (error) {
    logger.warn("Redis operation failed; using local fallback", {
      error: error.message,
    });
    return fallback();
  }
};

export const getCache = async (key) =>
  withRedis(
    async (redis) => {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    },
    () => {
      pruneExpiredMemoryEntries();
      return memoryStore.get(key)?.value ?? null;
    },
  );

export const setCache = async (key, value, ttlMs) =>
  withRedis(
    async (redis) => {
      await redis.set(key, JSON.stringify(value), "PX", ttlMs);
      return value;
    },
    () => {
      memoryStore.set(key, {
        value,
        expiresAt: ttlMs > 0 ? now() + ttlMs : 0,
      });
      return value;
    },
  );

export const deleteCache = async (key) =>
  withRedis(
    async (redis) => {
      await redis.del(key);
    },
    () => {
      memoryStore.delete(key);
    },
  );

export const incrementCounter = async (key, windowMs) =>
  withRedis(
    async (redis) => {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }
      return count;
    },
    () => {
      pruneExpiredMemoryEntries();
      const entry = memoryStore.get(key);
      if (!entry || (entry.expiresAt > 0 && entry.expiresAt <= now())) {
        memoryStore.set(key, {
          value: 1,
          expiresAt: now() + windowMs,
        });
        return 1;
      }

      entry.value = Number(entry.value || 0) + 1;
      memoryStore.set(key, entry);
      return entry.value;
    },
  );

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createLockId = () => crypto.randomUUID();

const tryAcquireMemoryLock = (key, lockId, ttlMs) => {
  pruneExpiredMemoryEntries();
  const existing = memoryStore.get(key);
  if (existing) {
    return false;
  }

  memoryStore.set(key, {
    value: lockId,
    expiresAt: now() + ttlMs,
  });
  return true;
};

const tryAcquireRedisLock = async (redis, key, lockId, ttlMs) => {
  const result = await redis.set(key, lockId, "PX", ttlMs, "NX");
  return result === "OK";
};

export const acquireLock = async (
  key,
  { ttlMs, waitTimeoutMs = 0, retryDelayMs = 100 } = {},
) => {
  const startedAt = now();
  const lockId = createLockId();
  const redis = getRedisConnection();

  while (now() - startedAt <= waitTimeoutMs) {
    const acquired = await withRedis(
      (client) => tryAcquireRedisLock(client, key, lockId, ttlMs),
      () => tryAcquireMemoryLock(key, lockId, ttlMs),
    );

    if (acquired) {
      return { key, lockId, ttlMs, redisBacked: Boolean(redis) };
    }

    if (waitTimeoutMs <= 0) {
      break;
    }

    await sleep(retryDelayMs);
  }

  return null;
};

export const releaseLock = async (lock) => {
  if (!lock) return;

  await withRedis(
    async (redis) => {
      await redis.eval(lockReleaseScript, 1, lock.key, lock.lockId);
    },
    () => {
      const current = memoryStore.get(lock.key);
      if (current?.value === lock.lockId) {
        memoryStore.delete(lock.key);
      }
    },
  );
};
