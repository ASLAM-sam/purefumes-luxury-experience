import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import express from "express";
import env from "../../config/env.js";
import logger from "../../config/logger.js";
import { clearAuthCookies, getCookieOptions } from "../cookies/auth.cookies.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const defaultAllowedOrigins = [
  "https://purefumeshyderabad.in",
  "https://www.purefumeshyderabad.in",
  "https://api.purefumeshyderabad.in",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const getAllowedOrigins = () =>
  [...new Set([...(env.ALLOWED_ORIGINS || []), ...defaultAllowedOrigins])]
    .map((origin) => String(origin || "").trim().replace(/\/$/, ""))
    .filter(Boolean);

const getRequestOrigin = (req) => {
  const origin = String(req.get("origin") || "").trim();
  if (origin) return origin.replace(/\/$/, "");

  const referer = String(req.get("referer") || "").trim();
  if (!referer) return "";

  try {
    return new URL(referer).origin.replace(/\/$/, "");
  } catch (_error) {
    return "";
  }
};

const originGuard = (req, res, next) => {
  if (safeMethods.has(req.method)) {
    return next();
  }

  const usesCookieAuth = Boolean(req.cookies?.accessToken || req.cookies?.refreshToken || req.cookies?.token);
  const hasBearerToken = Boolean(req.get("authorization"));

  if (!usesCookieAuth && !hasBearerToken) {
    return next();
  }

  const requestOrigin = getRequestOrigin(req);
  const allowedOrigins = getAllowedOrigins();

  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
    logger.warn("Blocked state-changing request from untrusted origin", {
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
      requestOrigin,
    });

    clearAuthCookies(res);
    return res.status(403).json({
      success: false,
      message: "Request origin is not trusted",
    });
  }

  return next();
};

export const applySecurityMiddleware = (app) => {
  const allowedOrigins = getAllowedOrigins();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.set("etag", false);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: ["'self'", ...allowedOrigins],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        },
      },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Request-Id",
        "X-Device-Id",
        "X-Device-Name",
        "Idempotency-Key",
      ],
      exposedHeaders: ["X-Request-Id"],
      optionsSuccessStatus: 204,
    }),
  );
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(compression());
  app.use(mongoSanitize({ replaceWith: "_" }));
  app.use(originGuard);
};

export { clearAuthCookies, getAllowedOrigins, getCookieOptions, originGuard };
