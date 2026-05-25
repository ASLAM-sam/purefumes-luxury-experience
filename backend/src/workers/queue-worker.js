import logger from "../../config/logger.js";
import { processEmailJob } from "../../jobs/emailJob.js";
import { createWorker, closeQueues } from "../queues/queue.factory.js";

const noopProcessor = (name) => async (job) => {
  logger.info("Processed background job", {
    queue: name,
    jobId: job.id,
  });
};

const workerDefinitions = [
  { name: "purefumes-email", processor: processEmailJob, concurrency: 5 },
  { name: "purefumes-notifications", processor: noopProcessor("purefumes-notifications"), concurrency: 4 },
  { name: "purefumes-invoices", processor: noopProcessor("purefumes-invoices"), concurrency: 2 },
  { name: "purefumes-analytics", processor: noopProcessor("purefumes-analytics"), concurrency: 4 },
  { name: "purefumes-logging", processor: noopProcessor("purefumes-logging"), concurrency: 3 },
  { name: "purefumes-image-processing", processor: noopProcessor("purefumes-image-processing"), concurrency: 2 },
  { name: "purefumes-heavy-tasks", processor: noopProcessor("purefumes-heavy-tasks"), concurrency: 2 },
];

let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("Queue worker shutting down", { signal });
  await closeQueues();
  process.exit(0);
};

workerDefinitions.forEach((definition) => {
  createWorker(definition);
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
