import rateLimit from "express-rate-limit";
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

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  skip: isCatalogReadRequest,
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
