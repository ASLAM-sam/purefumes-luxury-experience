import { sendTemplatedEmail } from "../services/email/emailService.js";
import BackInStockNotification from "../models/BackInStockNotification.js";

const getBackInStockNotificationId = (job) =>
  String(job?.data?.metadata?.backInStockNotificationId || "").trim();

export const processEmailJob = async (job) => {
  const notificationId = getBackInStockNotificationId(job);

  try {
    const info = await sendTemplatedEmail(job.data);

    if (notificationId) {
      await BackInStockNotification.findByIdAndUpdate(notificationId, {
        status: "sent",
        sentAt: new Date(),
        lastAttemptAt: new Date(),
        emailJobId: String(job?.id || info?.messageId || ""),
      });
    }

    return info;
  } catch (error) {
    if (notificationId) {
      await BackInStockNotification.findByIdAndUpdate(notificationId, {
        status: "failed",
        lastAttemptAt: new Date(),
      });
    }

    throw error;
  }
};
