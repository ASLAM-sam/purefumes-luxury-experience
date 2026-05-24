import mongoose from "mongoose";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import { getGoogleOAuthConfigStatus } from "./config/passport.js";
import { closeRedis } from "./config/redis.js";
import { captureException, flushSentry, initSentry } from "./config/sentry.js";
import { closeEmailQueue } from "./queues/emailQueue.js";
import { ensureAdminAccount } from "./services/auth/adminBootstrapService.js";
import { ensureDefaultBanners } from "./services/bannerService.js";

initSentry();

let apiServer = null;
let isShuttingDown = false;

const normalizeFatalError = (error) =>
  error instanceof Error ? error : new Error(String(error || "Unknown fatal error"));

const closeInfrastructure = async () => {
  await Promise.allSettled([
    closeEmailQueue(),
    closeRedis(),
    mongoose.connection.close(false),
  ]);
};

const reportFatalError = async (message, error) => {
  const normalizedError = normalizeFatalError(error);
  logger.error(message, { error: normalizedError.message, stack: normalizedError.stack });
  captureException(normalizedError, {
    tags: { area: "process", fatal: true },
    extra: { message },
  });
  await flushSentry(2000);
};

const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Closing API server...`);

  try {
    if (apiServer) {
      await new Promise((resolve) => {
        apiServer.close(resolve);
      });
    }

    await closeInfrastructure();
    await flushSentry(2000);
  } finally {
    process.exit(exitCode);
  }
};

const startServer = async () => {
  try {
    const { default: app } = await import("./app.js");

    await connectDB();
    await ensureAdminAccount();
    await ensureDefaultBanners();

    logger.info("Google OAuth configuration status", getGoogleOAuthConfigStatus());

    if (env.PAYMENT_BYPASS_ENABLED) {
      logger.warn("TEST PAYMENT MODE ENABLED", {
        environment: env.NODE_ENV,
        note: "Checkout will simulate gateway results without charging real customers.",
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

    apiServer = app.listen(env.PORT, () => {
      logger.info("Purefumes Hyderabad API running", { port: env.PORT });
    });

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    await reportFatalError("Failed to start API", error);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  void reportFatalError("Unhandled rejection", error).finally(() => shutdown("unhandledRejection", 1));
});

process.on("uncaughtException", (error) => {
  void reportFatalError("Uncaught exception", error).finally(() => shutdown("uncaughtException", 1));
});
