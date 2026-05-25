import env from "../config/env.js";
import logger from "../config/logger.js";
import { incrementCounter } from "../src/cache/redis-cache.js";

const rateLimitMessage = {
  success: false,
  message: "Too many requests from this client. Please try again after a short delay.",
};

const getClientIp = (req) =>
  String(req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();

const isLocalDevelopmentRequest = (req) => {
  if (env.isProduction) return false;

  const ip = getClientIp(req).toLowerCase();
  return ip === "::1" || ip === "127.0.0.1" || ip.includes("127.0.0.1") || ip.includes("localhost");
};

const buildKey = (name, req, keyGenerator) =>
  `${name}:${keyGenerator ? keyGenerator(req) : `${getClientIp(req)}:${req.path}`}`;

const createLimiter = ({ name, windowMs, limit, keyGenerator, skip }) => async (req, res, next) => {
  if (skip?.(req) || isLocalDevelopmentRequest(req)) {
    return next();
  }

  const key = buildKey(name, req, keyGenerator);
  const count = await incrementCounter(key, windowMs);

  if (count <= limit) {
    return next();
  }

  logger.warn("Rate limit exceeded", {
    requestId: req.id,
    ip: getClientIp(req),
    method: req.method,
    path: req.originalUrl,
    limiter: name,
    count,
    limit,
  });

  return res.status(429).json(rateLimitMessage);
};

const isCatalogReadRequest = (req) =>
  req.method === "GET" &&
  (req.path.startsWith("/products") ||
    req.path.startsWith("/brands") ||
    req.path.startsWith("/categories") ||
    req.path === "/health" ||
    req.path === "/metrics");

const isAuthSessionRequest = (req) =>
  req.path === "/auth/me" ||
  req.path === "/auth/refresh" ||
  req.path === "/auth/config" ||
  req.path === "/auth/logout";

const isAdminScopedRequest = (req) =>
  req.path.startsWith("/admin") || req.path.startsWith("/analytics");

export const apiLimiter = createLimiter({
  name: "api",
  windowMs: 60_000,
  limit: 300,
  skip: (req) => isCatalogReadRequest(req) || isAuthSessionRequest(req) || isAdminScopedRequest(req),
});

export const authLimiter = createLimiter({
  name: "auth",
  windowMs: 60_000,
  limit: 30,
});

export const failedLoginLimiter = createLimiter({
  name: "login",
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) =>
    `${getClientIp(req)}:${String(req.body.identifier || req.body.email || req.body.mobile || "").trim().toLowerCase()}`,
});

export const forgotPasswordLimiter = createLimiter({
  name: "forgot-password",
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => `${getClientIp(req)}:${String(req.body.email || "").trim().toLowerCase()}`,
});

export const signupLimiter = createLimiter({
  name: "signup",
  windowMs: 15 * 60 * 1000,
  limit: 6,
  keyGenerator: (req) => `${getClientIp(req)}:${String(req.body.email || "").trim().toLowerCase()}`,
});

export const catalogLimiter = createLimiter({
  name: "catalog",
  windowMs: 60_000,
  limit: 500,
  skip: (req) => req.method === "OPTIONS",
});

export const adminLimiter = createLimiter({
  name: "admin",
  windowMs: 60_000,
  limit: 120,
});

export const uploadLimiter = createLimiter({
  name: "upload",
  windowMs: 60_000,
  limit: 40,
});

export const publicRequestLimiter = createLimiter({
  name: "public-request",
  windowMs: 60_000,
  limit: 20,
});

export const orderLimiter = createLimiter({
  name: "order",
  windowMs: 60_000,
  limit: 30,
});

export const couponLimiter = createLimiter({
  name: "coupon",
  windowMs: 60_000,
  limit: 30,
});

export const recordFailedLoginAttempt = async (_identifier) => {};

export const resetLoginRateLimit = async (_identifier) => {};
