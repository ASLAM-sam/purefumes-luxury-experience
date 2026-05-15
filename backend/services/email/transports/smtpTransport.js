import nodemailer from "nodemailer";
import env from "../../../config/env.js";
import logger from "../../../config/logger.js";

let transporter;

export const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.SMTP_HOST) {
    logger.warn("SMTP_HOST is not configured; using JSON email transport");
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  // Log SMTP configuration on startup
  logger.info("Initializing SMTP transporter", {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    hasAuth: Boolean(env.SMTP_USER && env.SMTP_PASS),
    smtpUser: env.SMTP_USER ? env.SMTP_USER.substring(0, 10) + "..." : "not set",
    mailFrom: env.MAIL_FROM,
  });

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      logger.error("SMTP transporter verification failed", {
        error: error.message,
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        hasAuth: Boolean(env.SMTP_USER && env.SMTP_PASS),
      });
    } else {
      logger.info("SMTP transporter verified successfully", {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
      });
    }
  });

  return transporter;
};
