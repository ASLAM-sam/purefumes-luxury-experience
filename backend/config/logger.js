import fs from "fs";
import path from "path";
import winston from "winston";
import env from "./env.js";
import { redactSensitive } from "../utils/redaction.js";

const logsDir = path.resolve("logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    Object.assign(info, redactSensitive(info));
    return info;
  })(),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: env.isProduction ? "info" : "debug",
  defaultMeta: { service: "purefumes-api" },
  format: baseFormat,
  transports: [
    new winston.transports.Console({
      format: env.isProduction
        ? baseFormat
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
              return `${timestamp} ${level}: ${message}${extra}`;
            }),
          ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
});

export default logger;
