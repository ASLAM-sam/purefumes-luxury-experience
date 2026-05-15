import crypto from "crypto";
import morgan from "morgan";
import logger from "../config/logger.js";

const SENSITIVE_QUERY_KEYS = new Set([
  "token",
  "code",
  "password",
  "resetToken",
  "verificationToken",
  "paymentSignature",
]);

const sanitizeUrl = (url = "") => {
  try {
    const parsed = new URL(url, "http://local.request");

    parsed.searchParams.forEach((_value, key) => {
      if (SENSITIVE_QUERY_KEYS.has(key)) {
        parsed.searchParams.set(key, "[redacted]");
      }
    });

    return `${parsed.pathname}${parsed.search}`;
  } catch (_error) {
    return String(url).replace(/([?&](?:token|code|password|resetToken|verificationToken|paymentSignature)=)[^&]+/gi, "$1[redacted]");
  }
};

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
