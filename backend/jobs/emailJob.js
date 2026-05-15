import { sendTemplatedEmail } from "../services/email/emailService.js";

export const processEmailJob = async (job) => sendTemplatedEmail(job.data);
