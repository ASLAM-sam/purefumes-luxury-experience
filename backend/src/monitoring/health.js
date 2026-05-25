import mongoose from "mongoose";
import os from "os";
import { getRedisConnection } from "../../config/redis.js";

export const getHealthSnapshot = async () => {
  const redis = getRedisConnection();
  let redisStatus = "disabled";

  if (redis) {
    redisStatus = redis.status;
  }

  return {
    status:
      mongoose.connection.readyState === 1 &&
      (!redis || redis.status === "ready" || redis.status === "connect")
        ? "ok"
        : "degraded",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    hostname: os.hostname(),
    memory: process.memoryUsage(),
    cpuLoad: os.loadavg(),
    dependencies: {
      mongodb: mongoose.connection.readyState === 1 ? "ready" : "not-ready",
      redis: redisStatus,
    },
  };
};
