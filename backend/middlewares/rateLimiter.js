import rateLimit from "express-rate-limit";
import env from "../config/env.js";
import logger from "../config/logger.js";

const rateLimitMessage = {
  success: false,
  message: "Too many requests from this IP. Please try again after 15 minutes.",
};

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: rateLimitMessage,
    handler: (req, res, _next, limiterOptions) => {
      logger.warn("Rate limit exceeded", {
        requestId: req.id,
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        userAgent: req.get("user-agent") || "",
      });

      res.status(limiterOptions.statusCode).json(limiterOptions.message);
    },
    ...options,
  });

const isCatalogReadRequest = (req) =>
  req.method === "GET" &&
  (req.path.startsWith("/products") ||
    req.path.startsWith("/brands") ||
    req.path.startsWith("/categories") ||
    req.path === "/health");

const isLocalDevelopmentRequest = (req) => {
  if (env.isProduction) return false;

  const ip = String(req.ip || req.socket?.remoteAddress || "").toLowerCase();
  return ip === "::1" || ip === "127.0.0.1" || ip.includes("127.0.0.1") || ip.includes("localhost");
};

const isAuthSessionRequest = (req) =>
  req.path === "/auth/login" ||
  req.path === "/auth/me" ||
  req.path === "/auth/refresh" ||
  req.path === "/auth/csrf-token" ||
  req.path === "/auth/config" ||
  req.path === "/auth/logout";

const isAdminScopedRequest = (req) =>
  req.path.startsWith("/admin") || req.path.startsWith("/analytics");

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  skip: (req) =>
    isLocalDevelopmentRequest(req) ||
    isCatalogReadRequest(req) ||
    isAuthSessionRequest(req) ||
    isAdminScopedRequest(req),
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const FAILED_LOGIN_LIMIT = env.NODE_ENV === "development" ? 50 : 5;
const failedLoginAttempts = new Map();

const getLoginIdentifier = (identifier = "") =>
  String(identifier || "")
    .trim()
    .toLowerCase();

const getClientIp = (req) =>
  String(req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();

const getLoginRateLimitKey = (req, identifier = "") => {
  const ip = getClientIp(req) || "unknown-ip";
  const normalizedIdentifier = getLoginIdentifier(identifier || req.body?.identifier || req.body?.email || req.body?.mobile);
  return `${ip}:${normalizedIdentifier || "unknown-user"}`;
};

const getLoginAttemptRecord = (key) => {
  const current = failedLoginAttempts.get(key);
  const now = Date.now();

  if (!current || current.resetAt <= now) {
    failedLoginAttempts.delete(key);
    return { count: 0, resetAt: now + FAILED_LOGIN_WINDOW_MS };
  }

  return current;
};

export const failedLoginLimiter = (req, res, next) => {
  if (env.NODE_ENV === "development" && isLocalDevelopmentRequest(req)) {
    return next();
  }

  const key = getLoginRateLimitKey(req);
  const record = getLoginAttemptRecord(key);

  if (record.count >= FAILED_LOGIN_LIMIT) {
    logger.warn("Login rate limit hit", {
      requestId: req.id,
      ip: getClientIp(req),
      path: req.originalUrl,
      identifier: getLoginIdentifier(req.body?.identifier || req.body?.email || req.body?.mobile),
      remainingAttempts: 0,
      resetAt: new Date(record.resetAt).toISOString(),
    });

    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again after 15 minutes.",
      data: {
        resetAt: new Date(record.resetAt).toISOString(),
      },
    });
  }

  return next();
};

export const recordFailedLoginAttempt = (req, identifier = "") => {
  if (env.NODE_ENV === "development" && isLocalDevelopmentRequest(req)) {
    return;
  }

  const key = getLoginRateLimitKey(req, identifier);
  const current = getLoginAttemptRecord(key);
  const nextRecord = {
    count: current.count + 1,
    resetAt: current.resetAt,
  };

  failedLoginAttempts.set(key, nextRecord);

  logger.warn("Failed login attempt recorded", {
    requestId: req.id,
    ip: getClientIp(req),
    path: req.originalUrl,
    identifier: getLoginIdentifier(identifier),
    failedAttempts: nextRecord.count,
    remainingAttempts: Math.max(FAILED_LOGIN_LIMIT - nextRecord.count, 0),
    resetAt: new Date(nextRecord.resetAt).toISOString(),
  });
};

export const resetLoginRateLimit = (req, identifier = "") => {
  const key = getLoginRateLimitKey(req, identifier);
  failedLoginAttempts.delete(key);

  logger.info("Login rate limit reset after successful login", {
    requestId: req.id,
    ip: getClientIp(req),
    path: req.originalUrl,
    identifier: getLoginIdentifier(identifier),
  });
};

export const signupLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: "Too many signup attempts. Please try again later.",
  },
});

export const adminLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 240,
  message: {
    success: false,
    message: "Too many admin requests. Please slow down and try again shortly.",
  },
});

export const orderLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    success: false,
    message: "Too many order attempts. Please try again shortly.",
  },
});

export const uploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: {
    success: false,
    message: "Too many upload attempts. Please try again shortly.",
  },
});

export const publicRequestLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

export const couponLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: {
    success: false,
    message: "Too many coupon attempts. Please try again shortly.",
  },
});

export const catalogLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  skip: (req) => !isCatalogReadRequest(req),
});

export const forgotPasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again after 15 minutes.",
  },
});
