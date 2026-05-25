import {
  applySecurityMiddleware,
  clearAuthCookies,
  getAllowedOrigins,
  getCookieOptions,
  originGuard,
} from "../src/middlewares/security.js";

export { applySecurityMiddleware, clearAuthCookies, getAllowedOrigins, getCookieOptions, originGuard };

export const csrfProtection = (_req, _res, next) => next();
export const setCsrfCookie = () => "";
