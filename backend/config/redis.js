import IORedis from "ioredis";
import env from "./env.js";
import logger from "./logger.js";

let redisConnection = null;

if (env.REDIS_URL) {
  redisConnection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redisConnection.on("error", (error) => {
    logger.error("Redis connection error", { error: error.message });
  });
}

export const getRedisConnection = () => redisConnection;

export const closeRedis = async () => {
  if (redisConnection) {
    await redisConnection.quit();
  }
};

export default redisConnection;
