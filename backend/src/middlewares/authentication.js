import { ApiError } from "../../middlewares/errorMiddleware.js";
import { verifyAccessToken } from "../auth/token.service.js";
import { getAuthenticatedUser } from "../services/auth.service.js";
import { findUserByIdForAuth } from "../repositories/auth.repository.js";

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
};

const getAccessToken = (req) =>
  String(req.cookies?.accessToken || req.cookies?.token || getBearerToken(req) || "");

const resolveAuthenticatedUser = async (req) => {
  const token = getAccessToken(req);
  if (!token) {
    return null;
  }

  const decoded = verifyAccessToken(token);
  if (decoded.type !== "access") {
    throw new ApiError(401, "Invalid access token");
  }

  const user = await findUserByIdForAuth(decoded.sub);
  if (!user) {
    throw new ApiError(401, "User session no longer exists");
  }
  if (user.isBanned) {
    throw new ApiError(403, "Your account has been disabled");
  }

  req.user = user;
  req.auth = {
    userId: decoded.sub,
    sessionId: decoded.sid,
    deviceId: decoded.did,
  };
  return user;
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = getAccessToken(req);
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const normalizedRole = String(decoded?.role || "").trim().toLowerCase();
    if (!["admin", "super-admin"].includes(normalizedRole)) {
      return next();
    }

    await resolveAuthenticatedUser(req);
    return next();
  } catch (_error) {
    return next();
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    await resolveAuthenticatedUser(req);
    return next();
  } catch (error) {
    const statusCode = error.statusCode || 401;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Authentication required",
    });
  }
};

export const authorizeRoles =
  (...roles) =>
  async (req, res, next) => {
    try {
      const user = req.user || (await resolveAuthenticatedUser(req));
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
        });
      }

      return next();
    } catch (error) {
      return res.status(error.statusCode || 401).json({
        success: false,
        message: error.message || "Authentication required",
      });
    }
  };

export const adminAuth = authorizeRoles("admin");

export const resolveCachedAuthUser = getAuthenticatedUser;
