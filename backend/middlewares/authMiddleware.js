import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User, { normalizeUserRole } from "../models/User.js";

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
};

const getAccessToken = (req) =>
  req.cookies?.token || req.cookies?.accessToken || getBearerToken(req);

export const optionalAuth = async (req, _res, next) => {
  const token = getAccessToken(req);

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (decoded.type !== "access") return next();

    const user = await User.findById(decoded.sub);
    if (user && !user.isBanned) {
      user.role = normalizeUserRole(user.role);
      req.user = user;
    }
  } catch (_error) {
    // Optional auth must never block public browsing.
  }

  next();
};

export const requireAuth = async (req, res, next) => {
  const token = getAccessToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });

    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session no longer exists",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    const normalizedRole = normalizeUserRole(user.role);
    if (user.role !== normalizedRole) {
      user.role = normalizedRole;
      await user.save();
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };

export const adminAuth = async (req, res, next) => {
  return requireAuth(req, res, (error) => {
    if (error) return next(error);

    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = { userId: req.user.id, role: req.user.role, email: req.user.email };
    return next();
  });
};
