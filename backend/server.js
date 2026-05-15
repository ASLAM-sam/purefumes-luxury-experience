import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import { getGoogleOAuthConfigStatus } from "./config/passport.js";
import { closeRedis } from "./config/redis.js";
import { closeEmailQueue } from "./queues/emailQueue.js";
import { ensureAdminAccount } from "./services/auth/adminBootstrapService.js";
import { ensureDefaultBanners } from "./services/bannerService.js";

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminAccount();
    await ensureDefaultBanners();

    logger.info("Google OAuth configuration status", getGoogleOAuthConfigStatus());

    if (env.PAYMENT_BYPASS_ENABLED) {
      logger.warn("PAYMENT BYPASS MODE ENABLED", {
        environment: env.NODE_ENV,
        note: "Orders will be auto-paid in development mode.",
      });
    }

    // Log SMTP configuration on startup
    logger.info("SMTP Configuration loaded", {
      smtpHost: env.SMTP_HOST,
      smtpPort: env.SMTP_PORT,
      smtpUser: env.SMTP_USER ? env.SMTP_USER.substring(0, 10) + "..." : "not set",
      mailFrom: env.MAIL_FROM,
      smtpSecure: env.SMTP_SECURE,
    });

    const server = app.listen(env.PORT, () => {
      logger.info("Purefumes Hyderabad API running", { port: env.PORT });
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Closing API server...`);
      server.close(async () => {
        await Promise.allSettled([
          closeEmailQueue(),
          closeRedis(),
          mongoose.connection.close(false),
        ]);
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start API", { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection", { error: error.message, stack: error.stack });
  process.exit(1);
});
