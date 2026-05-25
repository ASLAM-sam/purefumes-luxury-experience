import { Queue, Worker } from "bullmq";
import logger from "../../config/logger.js";
import { getRedisConnection } from "../../config/redis.js";

const queues = new Map();
const workers = [];
const workerConnections = [];

const defaultJobOptions = {
  attempts: 5,
  backoff: { type: "exponential", delay: 2_000 },
  removeOnComplete: 1_000,
  removeOnFail: 5_000,
};

export const getQueue = (name) => {
  if (queues.has(name)) {
    return queues.get(name);
  }

  const redis = getRedisConnection();
  if (!redis) {
    return null;
  }

  const queue = new Queue(name, {
    connection: redis,
    defaultJobOptions,
  });
  queues.set(name, queue);
  return queue;
};

export const createWorker = ({ name, processor, concurrency = 5 }) => {
  const redis = getRedisConnection();
  if (!redis) {
    logger.warn("Worker startup skipped because Redis is disabled", {
      queue: name,
    });
    return null;
  }

  const workerConnection = redis.duplicate();
  workerConnections.push(workerConnection);
  const worker = new Worker(name, processor, {
    connection: workerConnection,
    concurrency,
  });

  worker.on("failed", (job, error) => {
    logger.error("Queue job failed", {
      queue: name,
      jobId: job?.id,
      error: error.message,
    });
  });

  workers.push(worker);
  return worker;
};

export const closeQueues = async () => {
  await Promise.allSettled(
    [
      ...workers.map((worker) => worker.close()),
      ...workerConnections.map((connection) => connection.quit()),
      ...[...queues.values()].map((queue) => queue.close()),
    ],
  );
};
