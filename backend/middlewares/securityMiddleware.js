import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import env from "../config/env.js";
import logger from "../config/logger.js";
import { createRandomToken, timingSafeEqual } from "../utils/crypto.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const csrfHeaderName = "X-CSRF-Token";
const productionOrigins = [
  "https://purefumeshyderabad.com",
  "https://www.purefumeshyderabad.com",
];

const getSameSiteValue = () => {
  const configuredValue = String(env.COOKIE_SAME_SITE || "").trim().toLowerCase();
  return ["lax", "strict", "none"].includes(configuredValue) ? configuredValue : "lax";
};

const shouldUseSecureCookies = () => env.isProduction || env.ENFORCE_HTTPS;

export const getAllowedOrigins = () => {
  return [...new Set([...productionOrigins, ...(env.ALLOWED_ORIGINS || [])])]
    .filter(Boolean)
    .filter((origin) => origin !== "*");
};

export const getCookieOptions = ({ httpOnly = true, maxAge } = {}) => ({
  httpOnly,
  secure: shouldUseSecureCookies(),
  sameSite: getSameSiteValue(),
  signed: false,
  maxAge,
  domain: env.COOKIE_DOMAIN,
  path: "/",
});

export const setCsrfCookie = (res) => {
  const csrfToken = createRandomToken(24);
  res.cookie("csrfToken", csrfToken, getCookieOptions({ httpOnly: false }));
  res.set(csrfHeaderName, csrfToken);
  return csrfToken;
};

export const clearAuthCookies = (res) => {
  ["token", "accessToken", "refreshToken", "csrfToken"].forEach((name) => {
    res.clearCookie(name, getCookieOptions({ httpOnly: name !== "csrfToken" }));
  });
};

export const csrfProtection = (req, res, next) => {
  if (safeMethods.has(req.method)) {
    return next();
  }

  const usesCookieAuth = Boolean(
    req.cookies?.token || req.cookies?.accessToken || req.cookies?.refreshToken,
  );

  if (!usesCookieAuth) {
    return next();
  }

  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.get("x-csrf-token");

  if (csrfCookie && csrfHeader && timingSafeEqual(csrfCookie, csrfHeader)) {
    return next();
  }

  logger.warn("CSRF token validation failed", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    origin: req.get("origin") || "",
    hasAccessCookie: Boolean(req.cookies?.token || req.cookies?.accessToken),
    hasRefreshCookie: Boolean(req.cookies?.refreshToken),
    hasCsrfCookie: Boolean(csrfCookie),
    hasCsrfHeader: Boolean(csrfHeader),
  });

  return res.status(403).json({
    success: false,
    message: "CSRF token validation failed",
  });
};

export const applySecurityMiddleware = (app) => {
  const allowedOrigins = getAllowedOrigins();

  app.set("trust proxy", 1);
  app.set("etag", false);
  app.disable("x-powered-by");

  app.use((req, res, next) => {
    if (!env.ENFORCE_HTTPS || req.secure || req.get("x-forwarded-proto") === "https") {
      return next();
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return res.status(426).json({
        success: false,
        message: "HTTPS is required",
      });
    }

    return res.redirect(308, `https://${req.get("host")}${req.originalUrl}`);
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'none'"],
          baseUri: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'none'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", ...allowedOrigins],
        },
      },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", csrfHeaderName, "X-Requested-With"],
      exposedHeaders: [csrfHeaderName, "X-Request-Id"],
      methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
      optionsSuccessStatus: 204,
    }),
  );
  app.use(compression());
  app.use(mongoSanitize({ replaceWith: "_" }));
};
