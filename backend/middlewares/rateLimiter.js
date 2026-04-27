import rateLimit from "express-rate-limit";

const rateLimitMessage = {
  success: false,
  message: "Too many requests from this IP. Please try again after 15 minutes.",
};

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: rateLimitMessage,
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

export const catalogLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  skip: (req) => req.method !== "GET",
});
