import IORedis from "ioredis";
import env from "./env.js";
import logger from "./logger.js";

let redisConnection = null;

if (env.REDIS_URL) {
  redisConnection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableReadyCheck: true,
    retryStrategy(attempt) {
      return Math.min(attempt * 250, 5000);
    },
    reconnectOnError() {
      return true;
    },
  });

  redisConnection.on("connect", () => {
    logger.info("Redis connection established");
  });

  redisConnection.on("ready", () => {
    logger.info("Redis connection ready");
  });

  redisConnection.on("error", (error) => {
    logger.error("Redis connection error", { error: error.message });
  });

  redisConnection.on("close", () => {
    logger.warn("Redis connection closed");
  });
}

export const getRedisConnection = () => redisConnection;

export const closeRedis = async () => {
  if (redisConnection) {
    await redisConnection.quit();
  }
};

export default redisConnection;
