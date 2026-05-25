import { processEmailJob } from "../jobs/emailJob.js";
import { getQueue, closeQueues } from "../src/queues/queue.factory.js";

const queueName = "purefumes-email";

export const addEmailJob = async (payload, options = {}) => {
  const queue = getQueue(queueName);
  if (queue) {
    return queue.add(payload.template || "email", payload, options);
  }

  process.nextTick(() => {
    processEmailJob({ data: payload }).catch(() => {});
  });

  return { id: "inline" };
};

export const closeEmailQueue = async () => {
  await closeQueues();
};
