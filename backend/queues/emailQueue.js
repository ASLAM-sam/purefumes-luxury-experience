import { Queue, Worker } from "bullmq";
import logger from "../config/logger.js";
import redisConnection from "../config/redis.js";
import { processEmailJob } from "../jobs/emailJob.js";

const queueName = "purefumes-email";
let emailQueue = null;
let emailWorker = null;

if (redisConnection) {
  emailQueue = new Queue(queueName, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });

  emailWorker = new Worker(queueName, processEmailJob, {
    connection: redisConnection,
    concurrency: 5,
  });

  emailWorker.on("failed", (job, error) => {
    logger.error("Email job failed", {
      jobId: job?.id,
      template: job?.data?.template,
      error: error.message,
    });
  });
}

export const addEmailJob = async (payload, options = {}) => {
  if (emailQueue) {
    return emailQueue.add(payload.template || "email", payload, options);
  }

  process.nextTick(() => {
    processEmailJob({ data: payload }).catch((error) => {
      logger.error("Inline email job failed", {
        template: payload.template,
        error: error.message,
      });
    });
  });

  return { id: "inline" };
};

export const closeEmailQueue = async () => {
  if (emailWorker) await emailWorker.close();
  if (emailQueue) await emailQueue.close();
};
