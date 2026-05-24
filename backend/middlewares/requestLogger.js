import crypto from "crypto";
import morgan from "morgan";
import logger from "../config/logger.js";
import { sanitizeUrl } from "../utils/redaction.js";

export const attachRequestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
};

export const requestLogger = morgan((tokens, req, res) => {
  const status = Number(tokens.status(req, res) || 0);
  const responseTime = tokens["response-time"](req, res);

  if (status >= 400) {
    logger.warn("HTTP request completed with error status", {
      requestId: req.id,
      method: tokens.method(req, res),
      path: sanitizeUrl(tokens.url(req, res)),
      status,
      responseTimeMs: responseTime,
      ip: tokens["remote-addr"](req, res),
      userAgent: tokens["user-agent"](req, res),
    });
    return null;
  }

  return JSON.stringify({
    requestId: req.id,
    method: tokens.method(req, res),
    path: sanitizeUrl(tokens.url(req, res)),
    status,
    responseTimeMs: responseTime,
    ip: tokens["remote-addr"](req, res),
    userAgent: tokens["user-agent"](req, res),
  });
}, {
  stream: {
    write(message) {
      const trimmed = message.trim();
      if (trimmed) {
        logger.info(trimmed);
      }
    },
  },
});
